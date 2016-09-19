import React from 'react';
import classNames from 'classnames';
import '../../styles/components/subrecord-panel';

export class SubRecordPanel extends React.Component {

  static propTypes = {
    type: React.PropTypes.string.isRequired,
    record: React.PropTypes.object.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    isDragging: React.PropTypes.bool.isRequired
  }

  render() {

    const { record, isDragging } = this.props;

    const recordString = record ? record.toString() : '';

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

    return (
      <div className={classes}>
        <div>{selectedFields}</div>
      </div>
    );
  }
}
