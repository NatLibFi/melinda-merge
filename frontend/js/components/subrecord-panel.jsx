import React from 'react';
import classNames from 'classnames';
import '../../styles/components/subrecord-panel';
import { MarcRecordPanel } from './marc-record-panel';
import _ from 'lodash';

export class SubRecordPanel extends React.Component {

  static propTypes = {
    record: React.PropTypes.object.isRequired,
    type: React.PropTypes.string.isRequired,
    isDragging: React.PropTypes.bool
  }

  render() {
    const { record, isDragging } = this.props;
    const selectedFields = record.fields
      .filter(f => _.includes(['245', '336', '773'], f.tag))
      .map(toOnlySubfields('773', ['g','q']))
      .filter(f => f.subfields.length !== 0);

    const classes = classNames({
      'is-dragging': isDragging,
      'card-panel': true,
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

    return (
      <div className={classes}>
        <MarcRecordPanel record={trimmedRecord} />
      </div>
    );
  }
}

function toOnlySubfields(tag, subfieldCodes) {
  return function(field) {
    if (field.tag === tag) { 
      const subfields = field.subfields.filter(s => _.includes(subfieldCodes, s.code));
      return _.assign({}, field, {subfields});
    }
    return field;
    
  };
}
