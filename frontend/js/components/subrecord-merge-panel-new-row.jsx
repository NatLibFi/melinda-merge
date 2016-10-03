import React from 'react';
import { DropTarget } from 'react-dnd';
import { ItemTypes } from '../constants';
import classNames from 'classnames';

export class SubrecordMergePanelNewRow extends React.Component {

  static propTypes = {
    onClick: React.PropTypes.func.isRequired,

    rowIndex: React.PropTypes.number.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired,
    isOver: React.PropTypes.bool
  }

  render() {
    const { connectDropTarget, isOver } = this.props;

    const classes = classNames('add-new-row', { 
      'is-over': isOver
    });
    console.log(isOver);

    return connectDropTarget(<tr className={classes} onClick={() => this.props.onClick()} />);
  }
}

var rowTarget = {
  drop(props, monitor) {
    
    const item = monitor.getItem();
    const fromRow = item.rowIndex;
    const toRow = props.rowIndex;
    
    props.onMoveRow(fromRow, toRow);
  },

  hover: function (props, monitor) {
    const draggedId = monitor.getItem().id;

    if (draggedId !== props.id) {
//            props.moveRow(draggedId, props.id);
    }
  }
};

var collect = function(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
};

export const DropSubrecordMergePanelNewRow = DropTarget(ItemTypes.SUBRECORD_ROW, rowTarget, collect)(SubrecordMergePanelNewRow);
