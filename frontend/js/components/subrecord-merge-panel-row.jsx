import React from 'react';
import classNames from 'classnames';
import { SubrecordActionTypes } from '../constants';
import { ItemTypes } from '../constants';
import _ from 'lodash';
import { DropTargetEmptySubRecordPanel } from './droppable-subrecord-empty-panel';
import { DraggableSubRecordPanel } from './draggable-subrecord-panel';
import { SubRecordPanel } from './subrecord-panel';
import { SubrecordActionButtonContainer } from './subrecord-action-button';
import { DragSource } from 'react-dnd';

import '../../styles/components/subrecord-merge-panel-row.scss';

export class SubrecordMergePanelRow extends React.Component {

  static propTypes = {
    sourceRecord: React.PropTypes.object,
    targetRecord: React.PropTypes.object,
    mergedRecord: React.PropTypes.object,
    selectedAction: React.PropTypes.string,
    rowIndex: React.PropTypes.number.isRequired,
    onRemoveRow: React.PropTypes.func.isRequired,

    connectDragSource: React.PropTypes.func.isRequired
  }

  renderSubrecordPanel(record, type, rowIndex) {

    if (record) {
      return (
        <DraggableSubRecordPanel record={record} type={type} rowIndex={rowIndex} />
      );
    } else {
      return <DropTargetEmptySubRecordPanel type={type} rowIndex={rowIndex}/>;
    }
  }

  renderMergedSubrecordPanel(mergedSubrecord, rowIndex, opts) {
    if (mergedSubrecord) {
      return (
        <div>
          <SubrecordActionButtonContainer rowIndex={rowIndex} {...opts} />
          <SubRecordPanel record={mergedSubrecord} />
        </div>
      );
    } else {
      return (<SubrecordActionButtonContainer rowIndex={rowIndex} {...opts} />);
    }
  }

  renderRemoveRowButton(rowIndex) {
    return (
      <button onClick={() => this.props.onRemoveRow(rowIndex)} className="btn-floating btn-hover-opaque btn-small waves-effect waves-light black remove-fab remove-fab-emptyrow">
        <i className="material-icons">clear</i>
      </button>
    );
  }

  render() {
    const {sourceRecord, targetRecord, mergedRecord, rowIndex, selectedAction, connectDragSource} = this.props;

    const isEmptyRow = sourceRecord === undefined && targetRecord === undefined;
    const isMergeActionAvailable = sourceRecord !== undefined && targetRecord !== undefined;
    const isCopyActionAvailable = !isMergeActionAvailable && !isEmptyRow;

    const rowClasses = classNames({
      'to-merge': selectedAction === SubrecordActionTypes.MERGE,
      'to-result': selectedAction === SubrecordActionTypes.COPY && sourceRecord !== undefined,
      'to-remove-source': selectedAction === SubrecordActionTypes.BLOCK && sourceRecord !== undefined,
      'to-remove-target': selectedAction === SubrecordActionTypes.BLOCK && targetRecord !== undefined
    });

    return connectDragSource (
      <tr className={rowClasses}>

        <td>
          {this.renderSubrecordPanel(sourceRecord, ItemTypes.SOURCE_SUBRECORD, rowIndex)}
        </td>
        <td>
          {this.renderSubrecordPanel(targetRecord, ItemTypes.TARGET_SUBRECORD, rowIndex)}
        </td>
        <td>
         { isEmptyRow ? this.renderRemoveRowButton(rowIndex) : this.renderMergedSubrecordPanel(mergedRecord, rowIndex, {isMergeActionAvailable, isCopyActionAvailable, selectedAction}) }
        </td>
      </tr>
    );

  }
}


const rowSource = {
  beginDrag(props) {
    console.log('beginDrag')
    const { type, rowIndex } = props;
    
    console.log(type, rowIndex);

    return { type, rowIndex };
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

export const DragSubrecordMergePanelRow = DragSource(ItemTypes.SUBRECORD_ROW, rowSource, collect)(SubrecordMergePanelRow);
