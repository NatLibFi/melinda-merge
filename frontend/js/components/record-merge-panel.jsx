/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records
*
* Copyright (C) 2015-2018 University Of Helsinki (The National Library Of Finland)
*
* This file is part of marc-merge-ui
*
* marc-merge-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* marc-merge-ui is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import _ from 'lodash';

import { editMergedRecord, toggleSourceRecordFieldSelection, dismissMergeWarning } from '../ui-actions';
import { saveRecord } from '../action-creators/record-actions';
import { RecordPanel } from 'commons/components/record-panel';
import { Preloader } from 'commons/components/preloader';
import { ErrorMessagePanel } from 'commons/components/error-message-panel';
import { MergeValidationErrorMessagePanel} from 'commons/components/merge-validation-error-message-panel';
import { isControlField } from '../utils';
import { SaveButtonPanel } from 'commons/components/save-button-panel';
import { recordSaveActionAvailable } from '../selectors/merge-status-selector';

import 'styles/components/record-merge-panel.scss';

export class RecordMergePanel extends React.Component {

  static propTypes = {
    mergedRecord: PropTypes.object,
    mergedRecordError: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Error)]),
    mergedRecordSaveError: PropTypes.instanceOf(Error),
    mergedRecordState: PropTypes.string.isRequired,
    sourceRecord: PropTypes.object,
    sourceRecordError: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Error)]),
    sourceRecordState: PropTypes.string.isRequired,
    targetRecord: PropTypes.object,
    targetRecordError: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Error)]),
    targetRecordState: PropTypes.string.isRequired,
    toggleSourceRecordFieldSelection: PropTypes.func.isRequired,
    saveRecord: PropTypes.func.isRequired,
    editMergedRecord: PropTypes.func.isRequired,
    dismissMergeWarning: PropTypes.func.isRequired,
    saveButtonVisible: PropTypes.bool.isRequired
  }

  toggleSourceRecordField(field) {
    if (!isControlField(field)) {
      this.props.toggleSourceRecordFieldSelection(field);
    }
  }

  toggleMergedRecordField(field) {
    if (field.fromOther && !isControlField(field)) {
      this.props.toggleSourceRecordFieldSelection(field);
    }
  }

  dismissWarning = () => {
    this.props.dismissMergeWarning();
  }

  renderSourceRecordPanel(recordState, errorMessage, record) {
    if (recordState === 'ERROR') {
      return <ErrorMessagePanel message={errorMessage} />;
    }

    return (       
      <RecordPanel
        showHeader
        title="Poistuva tietue"
        record={record}
        onFieldClick={(field) => this.toggleSourceRecordField(field)}>
        
        { recordState === 'LOADING' ? <div className="card-content"><Preloader /></div> : null }

      </RecordPanel>
    );
  }

  renderTargetRecordPanel(recordState, errorMessage, record) {
    if (recordState === 'ERROR') {
      return <ErrorMessagePanel message={errorMessage} />;
    }

    return (     
      <RecordPanel
        showHeader
        title="Säilyvä tietue"
        record={record}>

        { recordState === 'LOADING' ? <div className="card-content"><Preloader /></div> : null }
        
      </RecordPanel>
    );
  }

  renderMergedRecordPanel(recordState, errorMessage, record) {
    if (recordState === 'ERROR') {
      return <MergeValidationErrorMessagePanel error={errorMessage} />;
    }

    return (
      <React.Fragment>
        {recordState === 'WARNING' ? <MergeValidationErrorMessagePanel warning error={errorMessage} onDismiss={this.dismissWarning}/> : null}
        <RecordPanel
          showHeader
          editable
          title="Yhdistetty"
          record={record}
          onFieldClick={(field) => this.toggleMergedRecordField(field)}
          onRecordUpdate={(record) => this.props.editMergedRecord(record)}>

          { recordState === 'LOADING' ? <div className="card-content"><Preloader /></div> : null }

          { this.props.saveButtonVisible ? this.renderSaveButton() : null }

        </RecordPanel>
      </React.Fragment>
    );
  }

  renderSaveButton() {
    const statuses = {
      'SAVED': 'UPDATE_SUCCESS',
      'SAVE_ONGOING': 'UPDATE_ONGOING',
      'SAVE_FAILED': 'UPDATE_FAILED'
    };

    const status = statuses[this.props.mergedRecordState];

    const enabled = status !== 'UPDATE_ONGOING';

    return (
      <div className="card-action">
        <SaveButtonPanel 
          enabled={enabled}
          error={this.props.mergedRecordSaveError}
          status={status}
          onSubmit={() => this.handleRecordSave()}
        />
      </div>
    );
  }
  
  handleRecordSave() {
    const mergedRecordId = _.chain(this.props.mergedRecord.fields).filter(field => field.tag === '001').map('value').head().value();
    this.props.saveRecord(mergedRecordId, this.props.mergedRecord);
  }

  render() {

    return (
      <div className="row record-merge-panel">
        <div className="col s4">
          <div className="card darken-1 marc-record marc-record-source">
            {this.renderSourceRecordPanel(this.props.sourceRecordState, this.props.sourceRecordError, this.props.sourceRecord)}
          </div>
        </div>
        <div className="col s4">
          <div className="card darken-1 marc-record marc-record-target">
            {this.renderTargetRecordPanel(this.props.targetRecordState, this.props.targetRecordError, this.props.targetRecord)}
          </div>
        </div>
        <div className="col s4">
          <div className="card darken-1 marc-record marc-record-merged">
            {this.renderMergedRecordPanel(this.props.mergedRecordState, this.props.mergedRecordError, this.props.mergedRecord)}
          </div>
        </div>

      </div>
    );
  }
}

function mapStateToProps(state) {

  return {
    mergedRecord: (state.getIn(['mergedRecord', 'record'])),
    mergedRecordError: state.getIn(['mergedRecord', 'errorMessage']),
    mergedRecordSaveError: state.getIn(['mergedRecord', 'saveError']),
    mergedRecordState: state.getIn(['mergedRecord', 'state']),
    sourceRecord: (state.getIn(['sourceRecord', 'record'])),
    sourceRecordError: state.getIn(['sourceRecord', 'errorMessage']),
    sourceRecordState: state.getIn(['sourceRecord', 'state']),
    targetRecord: (state.getIn(['targetRecord', 'record'])),
    targetRecordError: state.getIn(['targetRecord', 'errorMessage']),
    targetRecordState: state.getIn(['targetRecord', 'state']),
    saveButtonVisible: recordSaveActionAvailable(state)
  };
}

export const RecordMergePanelContainer = connect(
  mapStateToProps,
  { editMergedRecord, toggleSourceRecordFieldSelection, saveRecord, dismissMergeWarning }
)(RecordMergePanel);
