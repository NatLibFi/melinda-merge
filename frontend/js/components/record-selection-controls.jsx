/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records
*
* Copyright (C) 2015-2018 University Of Helsinki (The National Library Of Finland)
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
import '../../styles/components/record-selection-controls';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
import _ from 'lodash';
import { withRouter } from 'react-router';
import classNames from 'classnames';
import { hostRecordActionsEnabled } from '../selectors/merge-status-selector';

const RECORD_LOADING_DELAY = 500;

export class RecordSelectionControls extends React.Component {

  static propTypes = {
    sourceRecordId: PropTypes.string.isRequired,
    targetRecordId: PropTypes.string.isRequired,
    fetchRecord: PropTypes.func.isRequired,
    swapRecords: PropTypes.func.isRequired,
    setSourceRecordId: PropTypes.func.isRequired,
    setTargetRecordId: PropTypes.func.isRequired,
    locationDidChange: PropTypes.func.isRequired,
    controlsEnabled: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired
  }

  constructor() {
    super();
    this.handleSourceChangeDebounced = _.debounce((event) => {
      this.props.fetchRecord(event.target.value, 'SOURCE');
    }, RECORD_LOADING_DELAY);

    this.handleTargetChangeDebounced = _.debounce((event) => {
      this.props.fetchRecord(event.target.value, 'TARGET');
    }, RECORD_LOADING_DELAY);
  }

  componentWillMount() {
    this.unlisten = this.props.history.listen(location => this.props.locationDidChange(location));
    this.props.locationDidChange(this.props.history.location);
  }

  componentWillReceiveProps(next) {
    if (next.targetRecordId === this.props.targetRecordId && next.sourceRecordId === this.props.sourceRecordId) return;

    if (_.identity(next.targetRecordId) && _.identity(next.sourceRecordId)) {
      this.props.history.push(`/records/${next.sourceRecordId}/and/${next.targetRecordId}`);
    }
  }

  componentDidUpdate() {
    // update text fields if they are prefilled.
    window.Materialize && window.Materialize.updateTextFields();
  }

  componentDidMount() {
    // update text fields if they are prefilled.
    window.Materialize && window.Materialize.updateTextFields();
  }

  componentWillUnmount() {
    if (typeof this.unlisten == 'function') {
      this.unlisten();
    }
  }

  handleChange(event) {
    const { controlsEnabled } = this.props;
    if (!controlsEnabled) {
      return;
    }

    event.persist();
    
    if (event.target.id === 'source_record') {
      this.props.setSourceRecordId(event.target.value);
      this.handleSourceChangeDebounced(event);
    }
    if (event.target.id === 'target_record') {
      this.props.setTargetRecordId(event.target.value);
      this.handleTargetChangeDebounced(event);
    }
  }

  handleSwap() {
    const { controlsEnabled } = this.props;

    if (controlsEnabled) {
      this.props.swapRecords();
    }

  }

  render() {

    const { controlsEnabled } = this.props;

    const swapButtonClasses = classNames('btn-floating', 'blue', {
      'waves-effect': controlsEnabled,
      'waves-light': controlsEnabled,
      'disabled': !controlsEnabled
    });

    return (
      <div className="row row-margin-swap record-selection-controls">
      
        <div className="col s2 offset-s1 input-field">
          <input id="source_record" type="tel" value={this.props.sourceRecordId} onChange={this.handleChange.bind(this)} disabled={!controlsEnabled} />
          <label htmlFor="source_record">Poistuva tietue</label>
        </div>
        <div className="col s2 control-swap-horizontal input-field">
          <div>
            <a className={swapButtonClasses} onClick={(e) => this.handleSwap(e)}>
              <i className="material-icons tooltip small" title="Vaihda keskenään">swap_horiz</i>
            </a>
          </div>
        </div>

        <div className="col s2 input-field">
          <input id="target_record" type="tel" value={this.props.targetRecordId} onChange={this.handleChange.bind(this)} disabled={!controlsEnabled}/>
          <label htmlFor="target_record">Säilyvä tietue</label>
        </div>
      
      </div>
    );
  }

}

function mapStateToProps(state) {
  return {
    sourceRecordId: state.getIn(['sourceRecord', 'id']) || '',
    targetRecordId: state.getIn(['targetRecord', 'id']) || '',
    controlsEnabled: hostRecordActionsEnabled(state)
  };
}

export const RecordSelectionControlsContainer = withRouter(connect(
  mapStateToProps,
  uiActionCreators
)(RecordSelectionControls));
