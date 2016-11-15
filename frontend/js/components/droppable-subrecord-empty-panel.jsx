import React from 'react';
import { ItemTypes } from '../constants';
import { DropTarget } from 'react-dnd';
import { EmptySubRecordPanelContainer } from './subrecord-empty-panel';
import * as subrecordActions from '../action-creators/subrecord-actions';
import {connect} from 'react-redux';
import compose from 'lodash/flowRight';

export class DroppableEmptySubRecordPanel extends React.Component {

  static propTypes = {
    connectDropTarget: React.PropTypes.func.isRequired,
    isOver: React.PropTypes.bool.isRequired,
    canDrop: React.PropTypes.bool.isRequired,
    type: React.PropTypes.string.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    changeSourceSubrecordRow: React.PropTypes.func.isRequired,
    changeTargetSubrecordRow: React.PropTypes.func.isRequired
  }

  render() {
    const { connectDropTarget } = this.props;

    return connectDropTarget(<div><EmptySubRecordPanelContainer {...this.props} /></div>);
  }
}

const emptySlotTarget = {
  drop(props, monitor, component) {

    const { type, rowIndex } = props;
    const item = monitor.getItem();
    
    const fromRowIndex = item.rowIndex;
    const toRowIndex = rowIndex;

    if (type == ItemTypes.SOURCE_SUBRECORD) {
      component.props.changeSourceSubrecordRow(fromRowIndex, toRowIndex);
    }
    if (type == ItemTypes.TARGET_SUBRECORD) {
      component.props.changeTargetSubrecordRow(fromRowIndex, toRowIndex);
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
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
 
  };
}

export const DropTargetEmptySubRecordPanel = compose(
  connect(
    null,
    subrecordActions
  ),
  DropTarget(ItemTypes.SUBRECORD, emptySlotTarget, collect)
)(DroppableEmptySubRecordPanel);
