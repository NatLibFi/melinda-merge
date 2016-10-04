import React from 'react';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
import _ from 'lodash';
import { List } from 'immutable';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { ItemTypes } from '../constants';
import compose from 'lodash/flowRight';
import { SubrecordActionButtonContainer } from './subrecord-action-button';
import { DragDropSubrecordMergePanelRow } from './subrecord-merge-panel-row';
import { SubrecordMergePanelNewRow } from './subrecord-merge-panel-new-row';

import '../../styles/components/subrecord-merge-panel.scss';

export class SubrecordMergePanel extends React.Component {

  static propTypes = {
    sourceSubrecords: React.PropTypes.array.isRequired,
    targetSubrecords: React.PropTypes.array.isRequired,
    mergedSubrecords: React.PropTypes.array.isRequired,
    selectedActions: React.PropTypes.array.isRequired,
    insertSubrecordRow: React.PropTypes.func.isRequired,
    removeSubrecordRow: React.PropTypes.func.isRequired,
    changeSubrecordRow: React.PropTypes.func.isRequired
  }

  renderSubrecordList() {
    const { sourceSubrecords, targetSubrecords, mergedSubrecords, selectedActions} = this.props;

    const items = _.zip(sourceSubrecords, targetSubrecords, mergedSubrecords, selectedActions).map(([sourceRecord, targetRecord, mergedRecord, selectedAction], i) => {
      
      const key = createKey(sourceRecord, targetRecord, i);

      return (<DragDropSubrecordMergePanelRow
        onMoveRow={this.onMoveRow.bind(this)}
        key={key}
        rowIndex={i}
        selectedAction={selectedAction}
        sourceRecord={sourceRecord}
        targetRecord={targetRecord}
        mergedRecord={mergedRecord}
        onRemoveRow={this.onRemoveRow.bind(this)}
      />);
    });

    return items.reduce((acc, item, i) => {

      return _.concat(acc, item, this.renderAddNewRowElement(i+1));

    }, [this.renderAddNewRowElement(0)]);

  }

  renderMergeActionButton(rowIndex, mergedRecord) {
    return (
      <div>
        <SubrecordActionButtonContainer rowIndex={rowIndex} />
        {this.renderSubrecordPanel(mergedRecord, ItemTypes.MERGED_SUBRECORD, rowIndex)}
      </div>);
  }

  renderAddNewRowElement(key) {
    return <SubrecordMergePanelNewRow key={key} onClick={this.onAddRow(key)} />;
  }

  onAddRow(rowIndex) {
    return function() {
      this.props.insertSubrecordRow(rowIndex);
    }.bind(this);
  }

  onRemoveRow(rowIndex) {
    this.props.removeSubrecordRow(rowIndex);
  }

  onMoveRow(fromIndex, toIndex) {
    this.props.changeSubrecordRow(fromIndex, toIndex);
  }

  render() {
    return (
      
      <table className="bordered subrecord-merge-panel">
        <tbody>
          {this.renderSubrecordList()}
        </tbody>
      </table>

    );
  }
}

function createKey(sourceRecord, targetRecord, i) {
  if (sourceRecord === undefined && targetRecord === undefined) {
    return `empty-${i}`;
  }

  const s = _.get(sourceRecord, 'fields', []).filter(f => f.tag === '001').map(f => f.value);
  const t = _.get(targetRecord, 'fields', []).filter(f => f.tag === '001').map(f => f.value);

  return `${s}-${t}`;
}

function mapStateToProps(state) {
  return {
    sourceSubrecords: state.getIn(['subrecords', 'sourceRecord'], List()).toJS(),
    targetSubrecords: state.getIn(['subrecords', 'targetRecord'], List()).toJS(),
    mergedSubrecords: state.getIn(['subrecords', 'mergedRecord'], List()).toJS(),
    selectedActions: state.getIn(['subrecords', 'actions'], List()).toJS()
  };
}

export const DraggableSubrecordMergePanelContainer = compose(

  DragDropContext(HTML5Backend),

  connect(
    mapStateToProps,
    uiActionCreators
  )
)(SubrecordMergePanel);
