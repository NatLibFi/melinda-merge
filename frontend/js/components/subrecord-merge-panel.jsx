import React from 'react';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
import { DraggableSubRecordPanel } from './subrecord-panel';
import { DropTargetEmptySubRecordPanel } from './subrecord-empty-panel';
import _ from 'lodash';
import { List } from 'immutable';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { ItemTypes } from '../constants';

import '../../styles/components/subrecord-merge-panel.scss';

export class SubrecordMergePanel extends React.Component {

  static propTypes = {
    sourceSubrecords: React.PropTypes.array.isRequired,
    targetSubrecords: React.PropTypes.array.isRequired,
    insertSubrecordRow: React.PropTypes.func.isRequired,
    removeSubrecordRow: React.PropTypes.func.isRequired
  }

  renderSubrecordPanel(record, type, rowIndex) {

    if (record) {
      return (
        <div className="card-panel darken-1 marc-record">
          <DraggableSubRecordPanel record={record} type={type} rowIndex={rowIndex} />
        </div>
      );
    } else {
      return <DropTargetEmptySubRecordPanel type={type} rowIndex={rowIndex}/>;
    }
  }

  renderSubrecordList() {

    const items = _.zip(this.props.sourceSubrecords, this.props.targetSubrecords).map(([sourceRecord, targetRecord], i) => {
     
      const key = createKey(sourceRecord, targetRecord, i);
      const isEmptyRow = sourceRecord === undefined && targetRecord === undefined;

      return (
        <tr key={key}>
          <td>
            {this.renderSubrecordPanel(sourceRecord, ItemTypes.SOURCE_SUBRECORD, i)}
          </td>
          <td>
            {this.renderSubrecordPanel(targetRecord, ItemTypes.TARGET_SUBRECORD, i)}
          </td>
          <td>
            { isEmptyRow ? this.renderRemoveRowButton(i) : this.renderMergeActionButton() }
          </td>

        </tr>

      );
    });

    return items.reduce((acc, item, i) => {

      return _.concat(acc, item, this.renderAddNewRowElement(i+1));

    }, [this.renderAddNewRowElement(0)]);

  }

  renderMergeActionButton() {
    return (
      <a className="btn-floating btn-small waves-effect waves-light yellow merge-action-button">
        <i className="material-icons">more_vert</i>
      </a>
    );
  }

  renderRemoveRowButton(rowIndex) {
    return (
      <button onClick={this.onRemoveRow(rowIndex)} className="btn-floating btn-hover-opaque btn-small waves-effect waves-light black remove-fab remove-fab-emptyrow">
        <i className="material-icons">clear</i>
      </button>
    );
  }

  renderAddNewRowElement(key) {
    return <tr key={key} className="add-new-row" onClick={this.onAddRow(key)} />;
  }

  onAddRow(rowIndex) {
    return function() {
      this.props.insertSubrecordRow(rowIndex);
    }.bind(this);
  }

  onRemoveRow(rowIndex) {
    return function() {
      this.props.removeSubrecordRow(rowIndex);
    }.bind(this);
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
    sourceSubrecords: state.getIn(['sourceRecord', 'subrecords'], List()).toJS(),
    targetSubrecords: state.getIn(['targetRecord', 'subrecords'], List()).toJS()
  };
}

export const SubrecordMergePanelContainer = connect(
  mapStateToProps,
  uiActionCreators
)(SubrecordMergePanel);

export const DraggableSubrecordMergePanelContainer = DragDropContext(HTML5Backend)(SubrecordMergePanelContainer);
