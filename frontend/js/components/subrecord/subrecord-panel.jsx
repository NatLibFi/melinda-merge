import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import '../../../styles/components/subrecord-panel';
import { MarcRecordPanel } from 'commons/components/marc-record-panel';
import { RecordPanel } from 'commons/components/record-panel';
import { SaveButtonPanel } from '../save-button-panel';

export class SubRecordPanel extends React.Component {

  static propTypes = {
    record: React.PropTypes.object.isRequired,
    type: React.PropTypes.string.isRequired,
    title: React.PropTypes.string,
    isDragging: React.PropTypes.bool,
    showHeader: React.PropTypes.bool,
    editable: React.PropTypes.bool,
    isExpanded: React.PropTypes.bool,
    isCompacted: React.PropTypes.bool,
    onFieldClick: React.PropTypes.func,
    onRecordUpdate: React.PropTypes.func,
    saveButtonVisible: React.PropTypes.bool,
    saveRecordError: React.PropTypes.instanceOf(Error),
    recordState: React.PropTypes.string,
    onSaveRecord: React.PropTypes.func,
  }

  renderSaveButton() {

    const statuses = {
      'UNSAVED': 'UPDATE_NOT_STARTED',
      'SAVED': 'UPDATE_SUCCESS',
      'SAVE_ONGOING': 'UPDATE_ONGOING',
      'SAVE_FAILED': 'UPDATE_FAILED'
    };

    const status = statuses[this.props.recordState];

    const enabled = status !== 'UPDATE_ONGOING';

    return (
      <div className="card-action">
        <SaveButtonPanel 
          enabled={enabled}
          error={this.props.saveRecordError}
          status={status}
          onSubmit={() => this.handleRecordSave()}
        />
      </div>
    );
  }
  
  handleRecordSave() {
    const recordId = _.chain(this.props.record.fields).filter(field => field.tag === '001').map('value').head().value();
    this.props.onSaveRecord(recordId, this.props.record);
  }

  render() {
    const { record, isDragging, isExpanded, isCompacted } = this.props;

    const visibleFields = isCompacted ? ['245'] : ['245', '336', '773'];

    const selectedFields = record.fields
      .filter(f => _.includes(visibleFields, f.tag))
      .map(toOnlySubfields('773', ['g','q']))
      .filter(f => f.subfields.length !== 0);

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
            onRecordUpdate={(record) => this.props.onRecordUpdate(record)}>

            { this.props.saveButtonVisible ? this.renderSaveButton() : null }

          </RecordPanel>
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

function toOnlySubfields(tag, subfieldCodes) {
  return function(field) {
    if (field.tag === tag) { 
      const subfields = field.subfields.filter(s => _.includes(subfieldCodes, s.code));
      return _.assign({}, field, {subfields});
    }
    return field;
  };
}
