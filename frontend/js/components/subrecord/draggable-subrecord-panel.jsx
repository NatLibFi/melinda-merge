import React from 'react';
import { DragSource } from 'react-dnd';
import { ItemTypes } from '../../constants';
import { SubRecordPanel } from './subrecord-panel';

class SubRecordPanelDragSource extends React.Component {

  static propTypes = {
    type: React.PropTypes.string.isRequired,
    record: React.PropTypes.object.isRequired,
    rowId: React.PropTypes.string.isRequired,
    connectDragSource: React.PropTypes.func.isRequired,
    isDragging: React.PropTypes.bool.isRequired,
    dragEnabled: React.PropTypes.bool.isRequired
  }

  render() {

    const { connectDragSource } = this.props;

    return connectDragSource(<div className="fill-height"><SubRecordPanel {...this.props} /></div>);
      
  }
}

const subrecordSource = {
  beginDrag(props) {
    const { type, rowId } = props;
    return { type, rowId };
  },
  canDrag(props) {
    if (props && props.isExpanded) {
      return false;
    }
    if (props && props.isCompacted) {
      return false;
    }
    if (props && props.dragEnabled !== true) {
      return false;
    }

    return true;
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

export const DraggableSubRecordPanel = DragSource(ItemTypes.SUBRECORD, subrecordSource, collect)(SubRecordPanelDragSource);
