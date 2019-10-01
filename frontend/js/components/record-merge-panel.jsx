/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records in Melinda
*
* Copyright (C) 2015-2018 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-merge
*
* melinda-merge program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-merge is distributed in the hope that it will be useful,
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
import { connect } from 'react-redux';
import _ from 'lodash';
import { editMergedRecord, toggleSourceRecordFieldSelection, dismissMergeWarning } from '../ui-actions';
import { saveRecord } from '../action-creators/record-actions';
import { RecordPanel } from 'commons/components/record-panel';
import { Preloader } from 'commons/components/preloader';
import { ErrorMessagePanel } from 'commons/components/error-message-panel';
import { MergeValidationErrorMessagePanel } from 'commons/components/merge-validation-error-message-panel';
import { isControlField } from '../utils';
import { SaveButtonPanel } from 'commons/components/save-button-panel';
import { hostRecordActionsEnabled, recordSaveActionAvailable} from '../selectors/merge-status-selector';
import classNames from 'classnames';
import '../../styles/components/record-merge-panel.scss';
import { withRouter } from 'react-router';
import * as uiActionCreators from '../ui-actions';

const RECORD_LOADING_DELAY = 500;

export class RecordMergePanel extends React.Component {

  static propTypes = {
    controlsEnabled: PropTypes.bool.isRequired,
    dismissMergeWarning: PropTypes.func.isRequired,
    editMergedRecord: PropTypes.func.isRequired,
    fetchRecord: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    locationDidChange: PropTypes.func.isRequired,
    mergedRecord: PropTypes.object,
    mergedRecordError: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Error)]),
    mergedRecordSaveError: PropTypes.instanceOf(Error),
    mergedRecordState: PropTypes.string.isRequired,
    saveButtonVisible: PropTypes.bool.isRequired,
    saveRecord: PropTypes.func.isRequired,
    sourceRecord: PropTypes.object,
    sourceRecordError: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Error)]),
    sourceRecordState: PropTypes.string.isRequired,
    sourceRecordId: PropTypes.string.isRequired,
    setSourceRecordId: PropTypes.func.isRequired,
    setTargetRecordId: PropTypes.func.isRequired,
    swapRecords: PropTypes.func.isRequired,
    targetRecord: PropTypes.object,
    targetRecordError: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Error)]),
    targetRecordId: PropTypes.string.isRequired,
    targetRecordState: PropTypes.string.isRequired,
    toggleSourceRecordFieldSelection: PropTypes.func.isRequired,
  }

  constructor() {
    super();
    this.handleSourceChangeDebounced = _.debounce((event) => {
      this.props.fetchRecord(event.target.value, 'SOURCE');
    }, RECORD_LOADING_DELAY);

    this.handleTargetChangeDebounced = _.debounce((event) => {
      this.props.fetchRecord(event.target.value, 'TARGET');
    }, RECORD_LOADING_DELAY);

    this.state = { editMode: false };
  }

  UNSAFE_componentWillMount() {
    this.unlisten = this.props.history.listen(location => this.props.locationDidChange(location));
    this.props.locationDidChange(this.props.history.location);
  }

  componentDidMount() {
    // update text fields if they are prefilled.
    window.Materialize && window.Materialize.updateTextFields();
  }

  UNSAFE_componentWillReceiveProps(next) {
    if (next.targetRecordId === this.props.targetRecordId && next.sourceRecordId === this.props.sourceRecordId) return;

    if (_.identity(next.targetRecordId) && _.identity(next.sourceRecordId)) {
      this.props.history.push(`/records/${next.sourceRecordId}/and/${next.targetRecordId}`);
    }
  }

  componentDidUpdate() {
    // update text fields if they are prefilled.
    window.Materialize && window.Materialize.updateTextFields();
  }


  componentWillUnmount() {
    if (typeof this.unlisten == 'function') {
      this.unlisten();
    }
  }

  handleEditModeChange(event) {
    event.preventDefault();
    this.setState({ editMode: !this.state.editMode });
  }

  handleChange(event) {
    const { controlsEnabled } = this.props;
    if (!controlsEnabled) {
      return;
    }

    event.persist();

    if (event.target.id === 'source_record') {
      this.props.setSourceRecordId(event.target.value);
      this.handleSourceChangeDebounced(event);
    }
    if (event.target.id === 'target_record') {
      this.props.setTargetRecordId(event.target.value);
      this.handleTargetChangeDebounced(event);
    }
  }

  handleSwap() {
    const { controlsEnabled } = this.props;

    if (controlsEnabled) {
      this.props.swapRecords();
    }

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
    const { controlsEnabled } = this.props;

    const swapButtonClasses = classNames({
      'waves-effect': controlsEnabled,
      'waves-light': controlsEnabled,
      'disabled': !(this.props.targetRecordId && this.props.sourceRecordId)
    });

    const button = (
      <div className="button tooltip" title="Vaihda keskenään">
        <a className={swapButtonClasses} href="#" onClick={(e) => this.handleSwap(e)}>
          <i className="material-icons left">swap_horiz</i>
        </a>
      </div>
    );

    const sourceField = this.recordInput('source_record', this.props.sourceRecordId, this.handleChange.bind(this), !controlsEnabled, 'Poistuva tietue', button);

    if (recordState === 'ERROR') {
      return (<ErrorMessagePanel
        typePanel
        recordHeader={sourceField}
        message={errorMessage}
      />);
    }

    return (
      <RecordPanel
        record={record}
        showHeader
        recordHeader={sourceField}
        onFieldClick={(field) => this.toggleSourceRecordField(field)}>
        {recordState === 'LOADING' ? <div className="card-content"><Preloader /></div> : null}
      </RecordPanel>
    );
  }

  recordInput(id, value, onChange, disable, label, button = null) {
    return (
      <div className="row title-row-card">
        <div className="input-field col 11s">
          <input id={id} type="tel" value={value} onChange={onChange} disabled={disable} />
          <label htmlFor={id}>{label}</label>
        </div>
        {button}
      </div>
    );
  }

  renderTargetRecordPanel(recordState, errorMessage, record) {
    const { controlsEnabled } = this.props;

    const targetField = this.recordInput('target_record', this.props.targetRecordId, this.handleChange.bind(this), !controlsEnabled, 'Säilyvä tietue');

    if (recordState === 'ERROR') {
      return (<ErrorMessagePanel
        typePanel
        recordHeader={targetField}
        message={errorMessage}
      />);
    }

    return (
      <RecordPanel
        record={record}
        showHeader
        recordHeader={targetField}
      >

        {recordState === 'LOADING' ? <div className="card-content"><Preloader /></div> : null}

      </RecordPanel>
    );
  }

  mergeHeader(record = null) {
    const editButtonClasses = classNames({
      disabled: !record,
      active: this.state.editMode
    });

    return (
      <div className="row row-no-bottom-margin">
        <div className="col s12">
          <ul className="title-row-card" ref={(c) => this._tabs = c}>
            <li className="title">Yhdistetty</li>
            <li className="button tooltip" title="Muokkaa"><a className={editButtonClasses} href="#" onClick={(e) => this.handleEditModeChange(e)}><i className="material-icons">edit</i></a></li>
          </ul>
        </div>
      </div>
    );
  }

  renderMergedRecordPanel(recordState, errorMessage, record) {
    if (recordState === 'ERROR') {
      return (<MergeValidationErrorMessagePanel
        recordHeader={this.mergeHeader()}
        typePanel
        error={errorMessage}
      />
      );
    }

    return (
      <React.Fragment>
        {recordState === 'WARNING' ? <MergeValidationErrorMessagePanel warning error={errorMessage} onDismiss={this.dismissWarning} /> : null}
        <RecordPanel
          showHeader
          recordHeader={this.mergeHeader(record)}
          editMode={this.state.editMode}
          record={record}
          onFieldClick={(field) => this.toggleMergedRecordField(field)}
          onRecordUpdate={(record) => this.props.editMergedRecord(record)}>

          {recordState === 'LOADING' ? <div className="card-content"><Preloader /></div> : null}

          {this.props.saveButtonVisible ? this.renderSaveButton() : null}

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
          <div className="card darken-1 z-depth-1 marc-record marc-record-source">
            {this.renderSourceRecordPanel(this.props.sourceRecordState, this.props.sourceRecordError, this.props.sourceRecord)}
          </div>
        </div>
        <div className="col s4">
          <div className="card darken-1 z-depth-1 marc-record marc-record-target">
            {this.renderTargetRecordPanel(this.props.targetRecordState, this.props.targetRecordError, this.props.targetRecord)}
          </div>
        </div>
        <div className="col s4">
          <div className="card darken-1 z-depth-1 marc-record marc-record-merged">
            {this.renderMergedRecordPanel(this.props.mergedRecordState, this.props.mergedRecordError, this.props.mergedRecord)}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {

  return {
    controlsEnabled: hostRecordActionsEnabled(state),
    mergedRecord: (state.getIn(['mergedRecord', 'record'])),
    mergedRecordError: state.getIn(['mergedRecord', 'errorMessage']),
    mergedRecordSaveError: state.getIn(['mergedRecord', 'saveError']),
    mergedRecordState: state.getIn(['mergedRecord', 'state']),
    sourceRecord: (state.getIn(['sourceRecord', 'record'])),
    sourceRecordError: state.getIn(['sourceRecord', 'errorMessage']),
    sourceRecordState: state.getIn(['sourceRecord', 'state']),
    targetRecord: (state.getIn(['targetRecord', 'record'])),
    targetRecordError: state.getIn(['targetRecord', 'errorMessage']),
    targetRecordId: state.getIn(['targetRecord', 'id']) || '',
    targetRecordState: state.getIn(['targetRecord', 'state']),
    saveButtonVisible: recordSaveActionAvailable(state),
    sourceRecordId: state.getIn(['sourceRecord', 'id']) || ''
  };
}

export const RecordMergePanelContainer = withRouter(connect(
  mapStateToProps,
  { editMergedRecord, toggleSourceRecordFieldSelection, saveRecord, dismissMergeWarning, ...uiActionCreators },
)(RecordMergePanel));
