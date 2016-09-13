import React from 'react';
import '../../styles/components/subrecord-panel';

export class SubRecordPanel extends React.Component {

  static propTypes = {
    record: React.PropTypes.object
  }

  constructor() {
    super();
  }

  render() {

    const recordString = this.props.record ? this.props.record.toString() : '';

    const selectedFields = recordString
      .split('\n')
      .filter(f => f.substr(0,3) === '245' || f.substr(0,3) === '337')
      .join('\n');


    return (
      <div>{selectedFields}</div>
    );
  }
}
