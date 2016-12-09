import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';

import { editMergedRecord, toggleSourceRecordFieldSelection } from '../ui-actions';
import { saveRecord } from '../action-creators/record-actions';
import { RecordPanel } from 'commons/components/record-panel';
import { Preloader } from 'commons/components/preloader';
import { ErrorMessagePanel } from './error-message-panel';
import { MergeValidationErrorMessagePanel} from './merge-validation-error-message-panel';
import { isControlField } from '../utils';
import { SaveButtonPanel } from './save-button-panel';
import { recordSaveActionAvailable } from '../selectors/merge-status-selector';

import '../../styles/components/record-merge-panel.scss';

export class RecordMergePanel extends React.Component {

  static propTypes = {
    mergedRecord: React.PropTypes.object,
    mergedRecordError: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Error)]),
    mergedRecordSaveError: React.PropTypes.instanceOf(Error),
    mergedRecordState: React.PropTypes.string.isRequired,
    sourceRecord: React.PropTypes.object,
    sourceRecordError: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Error)]),
    sourceRecordState: React.PropTypes.string.isRequired,
    targetRecord: React.PropTypes.object,
    targetRecordError: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Error)]),
    targetRecordState: React.PropTypes.string.isRequired,
    toggleSourceRecordFieldSelection: React.PropTypes.func.isRequired,
    saveRecord: React.PropTypes.func.isRequired,
    editMergedRecord: React.PropTypes.func.isRequired,
    saveButtonVisible: React.PropTypes.bool.isRequired
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
  { editMergedRecord, toggleSourceRecordFieldSelection, saveRecord }
)(RecordMergePanel);
