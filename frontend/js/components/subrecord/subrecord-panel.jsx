import React from 'react';
import classNames from 'classnames';
import '../../../styles/components/subrecord-panel';
import { MarcRecordPanel } from 'commons/components/marc-record-panel';
import _ from 'lodash';
import { RecordPanel } from 'commons/components/record-panel';

export class SubRecordPanel extends React.Component {

  static propTypes = {
    record: React.PropTypes.object.isRequired,
    type: React.PropTypes.string.isRequired,
    title: React.PropTypes.string,
    isDragging: React.PropTypes.bool,
    showHeader: React.PropTypes.bool,
    editable: React.PropTypes.bool,
    isExpanded: React.PropTypes.bool,
    onFieldClick: React.PropTypes.func,
    onRecordUpdate: React.PropTypes.func,
  }

  render() {
    const { record, isDragging, isExpanded } = this.props;


    const selectedFields = record.fields
      .filter(f => _.includes(['245', '336'], f.tag));

    const classes = classNames({
      'is-dragging': isDragging,
      'card': true,
      'darken-1': true,
      'marc-record': true,
      'marc-record-subrecord': true,
      'marc-record-source': this.props.type == 'SOURCE',
      'marc-record-target': this.props.type == 'TARGET',
      'marc-record-merged': this.props.type == 'MERGED'
    });

    const trimmedRecord = {
      fields: selectedFields
    };

    const res = isExpanded ? record : trimmedRecord;

    if (isExpanded) {
      return (
        <div className={classes}>
          <RecordPanel 
            showHeader={this.props.showHeader}
            editable={this.props.editable}
            title={this.props.title}
            record={record} 
            onFieldClick={this.props.onFieldClick}
            onRecordUpdate={(record) => this.props.onRecordUpdate(record)}
          />
        </div>
      );
    } else {

      return (
        <div className={classes}>
          <div className="card-content">
            <MarcRecordPanel record={res} onFieldClick={this.props.onFieldClick} />
          </div>
        </div>
      );      
    }

  }
}
