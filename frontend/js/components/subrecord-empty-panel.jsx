import React from 'react';
import { ItemTypes } from '../constants';
import { DropTarget } from 'react-dnd';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';

export class EmptySubRecordPanel extends React.Component {

  static propTypes = {
    connectDropTarget: React.PropTypes.func.isRequired,
    isOver: React.PropTypes.bool.isRequired,
    type: React.PropTypes.string.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    changeSourceSubrecordRow: React.PropTypes.func.isRequired,
    changeTargetSubrecordRow: React.PropTypes.func.isRequired
  }

  render() {
    const { connectDropTarget, isOver } = this.props;

    return connectDropTarget(<div className="empty-droppable" />);
  }
}

const emptySlotTarget = {
  drop(props, monitor, component) {

    const { type, rowIndex } = props;
    const item = monitor.getItem();
    
    const fromRowIndex = item.rowIndex;
    const toRowIndex = rowIndex;

    if (type == ItemTypes.SOURCE_SUBRECORD) {
      component.mergedProps.changeSourceSubrecordRow(fromRowIndex, toRowIndex);
    }
    if (type == ItemTypes.TARGET_SUBRECORD) {
      component.mergedProps.changeTargetSubrecordRow(fromRowIndex, toRowIndex);
    }

  },

  canDrop(props, monitor) {
    const item = monitor.getItem();
    return (props.type == item.type);
  }

};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

const EmptySubRecordPanelContainer = connect(
  null,
  uiActionCreators
)(EmptySubRecordPanel);


export const DropTargetEmptySubRecordPanel = DropTarget(ItemTypes.SUBRECORD, emptySlotTarget, collect)(EmptySubRecordPanelContainer);