import React from 'react';
import { DragSource } from 'react-dnd';
import { ItemTypes } from '../constants';
import classNames from 'classnames';
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

    const classes = classNames({
      'is-dragging': isDragging,
      'card-panel': true,
      'darken-1': true,
      'marc-record': true
    });

    return connectDragSource(
      <div className={classes}>
        <div>{selectedFields}</div>
      </div>
    );
  }
}

const subrecordSource = {
  beginDrag(props) {
    const { type, rowIndex } = props;
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
