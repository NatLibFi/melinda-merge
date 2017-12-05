/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records
*
* Copyright (C) 2015-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of marc-merge-ui
*
* marc-merge-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* marc-merge-ui is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import '../../../styles/components/subrecord-panel';
import { MarcRecordPanel } from 'commons/components/marc-record-panel';
import { RecordPanel } from 'commons/components/record-panel';
import { SaveButtonPanel } from '../save-button-panel';

export class SubRecordPanel extends React.Component {

  static propTypes = {
    record: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string,
    isDragging: PropTypes.bool,
    showHeader: PropTypes.bool,
    editable: PropTypes.bool,
    isExpanded: PropTypes.bool,
    isCompacted: PropTypes.bool,
    onFieldClick: PropTypes.func,
    onRecordUpdate: PropTypes.func,
    saveButtonVisible: PropTypes.bool,
    saveRecordError: PropTypes.instanceOf(Error),
    recordState: PropTypes.string,
    onSaveRecord: PropTypes.func,
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
