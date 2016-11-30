import React from 'react';
import { RecordPanel } from 'commons/components/record-panel';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
import '../../styles/components/record-merge-panel.scss';
import { Preloader } from 'commons/components/preloader';
import { ErrorMessagePanel } from './error-message-panel';
import { MergeValidationErrorMessagePanel} from './merge-validation-error-message-panel';
import { isControlField } from '../utils';

export class RecordMergePanel extends React.Component {

  static propTypes = {
    mergedRecord: React.PropTypes.object,
    mergedRecordError: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Error)]),
    mergedRecordState: React.PropTypes.string.isRequired,
    sourceRecord: React.PropTypes.object,
    sourceRecordError: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Error)]),
    sourceRecordState: React.PropTypes.string.isRequired,
    targetRecord: React.PropTypes.object,
    targetRecordError: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Error)]),
    targetRecordState: React.PropTypes.string.isRequired,
    toggleSourceRecordFieldSelection: React.PropTypes.func.isRequired,
    editMergedRecord: React.PropTypes.func.isRequired
  }

  getRecord(type) {
    switch(type) {
      case 'SOURCE': return this.props.sourceRecord;
      case 'TARGET': return this.props.targetRecord;
      case 'MERGED': return this.props.mergedRecord;
    }
  }
  getErrorMessage(type) {
    switch(type) {
      case 'SOURCE': return this.props.sourceRecordError;
      case 'TARGET': return this.props.targetRecordError;
      case 'MERGED': return this.props.mergedRecordError;
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

  getContent(recordState, type) {

    if (recordState === 'ERROR') {
      if (type === 'MERGED') {
        return <MergeValidationErrorMessagePanel error={this.getErrorMessage(type)} />;
      } else {
        return <ErrorMessagePanel message={this.getErrorMessage(type)} />;
      }
    }

    if (type === 'SOURCE') {

      const record = this.getRecord(type);

      return (       
        <RecordPanel
          showHeader
          title="Poistuva tietue"
          record={record}
          onFieldClick={(field) => this.toggleSourceRecordField(field)}>
          
          { recordState === 'LOADING' ? <Preloader /> : null }

        </RecordPanel>
        
      );
    }

    if (type === 'MERGED') {
      return (
       
        <RecordPanel 
          showHeader
          editable
          title="Yhdistetty"
          record={this.getRecord(type)} 
          onFieldClick={(field) => this.toggleMergedRecordField(field)}
          onRecordUpdate={(record) => this.props.editMergedRecord(record)}>

          { recordState === 'LOADING' ? <Preloader /> : null }

        </RecordPanel>
        
      );
    }

    if (type === 'TARGET') {

      const record = this.getRecord(type);

      return (
       
        <RecordPanel
          showHeader
          title="Säilyvä tietue"
          record={record}>
          
          { recordState === 'LOADING' ? <Preloader /> : null }

        </RecordPanel>
        
      );
    }

    // empty
    return '';
     
  }

  render() {
    return (
      <div className="row record-merge-panel">
        <div className="col s4">
          <div className="card darken-1 marc-record marc-record-source">
            {this.getContent(this.props.sourceRecordState, 'SOURCE')}
          </div>
        </div>
        <div className="col s4">
          <div className="card darken-1 marc-record marc-record-target">
            {this.getContent(this.props.targetRecordState, 'TARGET')}
          </div>
        </div>
        <div className="col s4">
          <div className="card darken-1 marc-record marc-record-merged">
            {this.getContent(this.props.mergedRecordState, 'MERGED')}
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
    mergedRecordState: state.getIn(['mergedRecord', 'state']),
    sourceRecord: (state.getIn(['sourceRecord', 'record'])),
    sourceRecordError: state.getIn(['sourceRecord', 'errorMessage']),
    sourceRecordState: state.getIn(['sourceRecord', 'state']),
    targetRecord: (state.getIn(['targetRecord', 'record'])),
    targetRecordError: state.getIn(['targetRecord', 'errorMessage']),
    targetRecordState: state.getIn(['targetRecord', 'state'])
  };
}

export const RecordMergePanelContainer = connect(
  mapStateToProps,
  uiActionCreators
)(RecordMergePanel);
