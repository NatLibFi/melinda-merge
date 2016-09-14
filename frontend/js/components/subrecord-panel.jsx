import React from 'react';
import { DragSource } from 'react-dnd';
import { ItemTypes } from '../constants';
import '../../styles/components/subrecord-panel';

export class SubRecordPanel extends React.Component {

  static propTypes = {
    type: React.PropTypes.string.isRequired,
    record: React.PropTypes.object.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    connectDragSource: React.PropTypes.func.isRequired,
    isDragging: React.PropTypes.bool.isRequired
  }

  constructor() {
    super();
  }

  render() {

    const { connectDragSource, isDragging } = this.props;

    const recordString = this.props.record ? this.props.record.toString() : '';

    const selectedFields = recordString
      .split('\n')
      .filter(f => f.substr(0,3) === '245' || f.substr(0,3) === '337')
      .join('\n');


    return connectDragSource(
      <div>{selectedFields}</div>
    );
  }
}

const subrecordSource = {
  beginDrag(props) {
    const { type, rowIndex } = props;
    console.log('beginDrag', type, rowIndex);
    return { type, rowIndex };
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

export const DraggableSubRecordPanel = DragSource(ItemTypes.SUBRECORD, subrecordSource, collect)(SubRecordPanel);
