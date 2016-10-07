import React from 'react';
import { MarcRecordPanel } from './marc-record-panel';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
import '../../styles/components/record-merge-panel.scss';
import { Preloader } from './preloader';
import { ErrorMessagePanel } from './error-message-panel';
import { isControlField } from '../utils';

export class RecordMergePanel extends React.Component {

  static propTypes = {
    mergedRecord: React.PropTypes.object,
    mergedRecordError: React.PropTypes.string,
    mergedRecordState: React.PropTypes.string.isRequired,
    sourceRecord: React.PropTypes.object,
    sourceRecordError: React.PropTypes.string,
    sourceRecordState: React.PropTypes.string.isRequired,
    targetRecord: React.PropTypes.object,
    targetRecordError: React.PropTypes.string,
    targetRecordState: React.PropTypes.string.isRequired,

    toggleSourceRecordFieldSelection: React.PropTypes.func.isRequired
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
    if (recordState === 'LOADING') {
      return <Preloader />;
    }

    if (recordState === 'LOADED') {

      if (type === 'SOURCE') {
        return (
          <MarcRecordPanel
            record={this.getRecord(type)} 
            onFieldClick={(field) => this.toggleSourceRecordField(field)}
          />
        );
      } else if(type === 'MERGED') {
        return (
          <MarcRecordPanel 
            record={this.getRecord(type)} 
            onFieldClick={(field) => this.toggleMergedRecordField(field)}
          />
        );
      } else {
        return (
          <MarcRecordPanel 
            record={this.getRecord(type)} 
          />
        );
      }
      
     
    
    }

    if (recordState === 'ERROR') {
      return <ErrorMessagePanel message={this.getErrorMessage(type)} />;
    }
    // empty
    return '';
     
  }

  render() {
    return (
      <div className="row record-merge-panel">
        <div className="col s4">
          <div className="card-panel darken-1 marc-record marc-record-source">
            {this.getContent(this.props.sourceRecordState, 'SOURCE')}
          </div>
        </div>
        <div className="col s4">
          <div className="card-panel darken-1 marc-record marc-record-target">
            {this.getContent(this.props.targetRecordState, 'TARGET')}
          </div>
        </div>
        <div className="col s4">
          <div className="card-panel darken-1 marc-record marc-record-merged">
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
