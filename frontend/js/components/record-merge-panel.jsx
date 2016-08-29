import React from 'react';
import { MarcRecordPanel } from './marc-record-panel';

export class RecordMergePanel extends React.Component {

  render() {
    return (
      <div className="row">
        <div className="col s4">
          <MarcRecordPanel />
        </div>
        <div className="col s4">
          <MarcRecordPanel />
        </div>
        <div className="col s4">
          <MarcRecordPanel />
        </div>

      </div>
    );
  }
}
