import React from 'react';
import classNames from 'classnames';
import { SubrecordActionTypes } from '../constants';
import { ItemTypes } from '../constants';
import { DropTargetEmptySubRecordPanel } from './droppable-subrecord-empty-panel';
import { DraggableSubRecordPanel } from './draggable-subrecord-panel';
import { SubRecordPanel } from './subrecord-panel';
import { SubrecordActionButtonContainer } from './subrecord-action-button';
import { DropTarget, DragSource } from 'react-dnd';

import '../../styles/components/subrecord-merge-panel-row.scss';

export class SubrecordMergePanelRow extends React.Component {

  static propTypes = {
    sourceRecord: React.PropTypes.object,
    targetRecord: React.PropTypes.object,
    mergedRecord: React.PropTypes.object,
    selectedAction: React.PropTypes.string,
    rowIndex: React.PropTypes.number.isRequired,
    onRemoveRow: React.PropTypes.func.isRequired,

    connectDragSource: React.PropTypes.func.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired,
    isOver: React.PropTypes.bool.isRequired
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
    const {sourceRecord, targetRecord, mergedRecord, rowIndex, selectedAction, connectDragSource, connectDropTarget, isOver} = this.props;

    const isEmptyRow = sourceRecord === undefined && targetRecord === undefined;
    const isMergeActionAvailable = sourceRecord !== undefined && targetRecord !== undefined;
    const isCopyActionAvailable = !isMergeActionAvailable && !isEmptyRow;

    const rowClasses = classNames({
      'to-merge': selectedAction === SubrecordActionTypes.MERGE,
      'to-result': selectedAction === SubrecordActionTypes.COPY && sourceRecord !== undefined,
      'to-remove-source': selectedAction === SubrecordActionTypes.BLOCK && sourceRecord !== undefined,
      'to-remove-target': selectedAction === SubrecordActionTypes.BLOCK && targetRecord !== undefined,
      'is-over': isOver
    });

    return connectDragSource(connectDropTarget(
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
    ));

  }
}

const rowSource = {

  beginDrag(props) {
    const { rowIndex } = props;
    return { rowIndex };
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}


var rowTarget = {
  drop(props, monitor) {
    
    const item = monitor.getItem();
    const fromRow = item.rowIndex;
    const toRow = props.rowIndex;
    
    props.onMoveRow(fromRow, toRow);
  },

};

var collectTarget = function(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
};

const dragSourceComponent = DragSource(ItemTypes.SUBRECORD_ROW, rowSource, collect)(SubrecordMergePanelRow);

export const DragDropSubrecordMergePanelRow = DropTarget(ItemTypes.SUBRECORD_ROW, rowTarget, collectTarget)(dragSourceComponent);
