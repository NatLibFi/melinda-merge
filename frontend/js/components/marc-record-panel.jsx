import React from 'react';
import '../../styles/components/marc-record-panel';

export class MarcRecordPanel extends React.Component {

  static propTypes = {
    record: React.PropTypes.string.isRequired
  }

  constructor() {
    super();
  }

  render() {
    return (
      <div>{this.props.record}</div>
    );
  }
}
