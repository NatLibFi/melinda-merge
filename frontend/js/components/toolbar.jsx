/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records in Melinda
*
* Copyright (C) 2015-2018 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-merge
*
* melinda-merge program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-merge is distributed in the hope that it will be useful,
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
import { DuplicateDatabaseStates } from '../constants';
import {connect} from 'react-redux';
import * as uiActionCreators from '../ui-actions';
import * as duplicateDatabaseActionCreators from '../action-creators/duplicate-database-actions';
import { mergeButtonEnabled } from '../selectors/merge-status-selector';
import classNames from 'classnames';
import _ from 'lodash';

export class ToolBar extends React.Component {

  static propTypes = {
    commitMerge: PropTypes.func.isRequired,
    mergeButtonEnabled: PropTypes.bool,
    resetWorkspace: PropTypes.func.isRequired,
    fetchCount: PropTypes.func.isRequired,
    fetchNextPair: PropTypes.func.isRequired,
    skipPair: PropTypes.func.isRequired,
    markAsNotDuplicate: PropTypes.func.isRequired,
    duplicatePairCount: PropTypes.number.isRequired,
    duplicateDatabaseStatus: PropTypes.string.isRequired,
    recordsAreFromDuplicateDatabase: PropTypes.bool.isRequired,
    mergedRecord: PropTypes.object
  }

  UNSAFE_componentWillMount() {
    this.props.fetchCount();
  }

  loadNextDuplicatePair(event) {
    event.preventDefault();
    if (this.props.duplicateDatabaseStatus === DuplicateDatabaseStates.READY) {
      this.props.fetchNextPair();
    }
  }

  skipCurrentDuplicatePair(event) {
    event.preventDefault();
    if (this.props.duplicateDatabaseStatus === DuplicateDatabaseStates.READY) {
      this.props.skipPair(event);
    }
  }

  markAsNonDuplicate(event) {
    event.preventDefault();
    if (this.props.duplicateDatabaseStatus === DuplicateDatabaseStates.READY) {
      this.props.markAsNotDuplicate(event);
    }
  }

  commitMerge(event) {
    event.preventDefault();
    this.props.commitMerge();
  }

  startNewPair(event) {
    event.preventDefault();
    this.props.resetWorkspace();
  }

  renderDuplicateCountBadge() {
    const count = this.props.duplicatePairCount;

    return count > 0 ? (<span className="badge tooltip" title="Tuplaehdotukset">{count}</span>) : null;
  }

  renderProgressIndicatorFor(action) {
    return this.props.duplicateDatabaseStatus === action ? <div className="progress lifted-progress"><div className="indeterminate" /></div> : null;
  }

  isEnabled() {
    return this.props.duplicateDatabaseStatus === DuplicateDatabaseStates.READY;
  }

  render() {

    const nextClasses = classNames({
      disabled: !this.isEnabled()
    });

    const skipClasses = classNames({
      disabled: !this.isEnabled() || !this.props.recordsAreFromDuplicateDatabase
    });
    
    const notDuplicateClasses = classNames({
      disabled: !this.isEnabled() || !this.props.recordsAreFromDuplicateDatabase
    });
    
    const mergeClasses = classNames({
      disabled: !this.props.mergeButtonEnabled || !this.props.mergedRecord
    });

    const classes = classNames('material-icons', 'tooltip');

    return (
      <ul id="nav" className="right">
        <li><a href="#" onClick={(e) => this.startNewPair(e)}><i className={classes} title="Aloita uusi">add</i></a></li>
        <li className={nextClasses}>
          <a href="#" onClick={(e) => this.loadNextDuplicatePair(e)}><i className={classes} title="Seuraava pari">navigate_next</i></a>
          {this.renderProgressIndicatorFor(DuplicateDatabaseStates.FETCH_NEXT_DUPLICATE_ONGOING)}
        </li>
        <li className={skipClasses}>
          <a href="#" onClick={(e) => this.skipCurrentDuplicatePair(e)}><i className={classes} title="Ohita">skip_next</i></a>
          {this.renderProgressIndicatorFor(DuplicateDatabaseStates.SKIP_PAIR_ONGOING)}
        </li>
        <li className={notDuplicateClasses}>
          <a href="#" onClick={(e) => this.markAsNonDuplicate(e)}><i className={classes} title="Ei tupla">layers_clear</i></a>
          {this.renderProgressIndicatorFor(DuplicateDatabaseStates.MARK_AS_NON_DUPLICATE_ONGOING)}
        </li>
        <li className={mergeClasses}>
          <a title="Yhdistä" href="#" onClick={(e) => this.commitMerge(e)} ><i className={classes}>call_merge</i></a>
          {this.renderProgressIndicatorFor(DuplicateDatabaseStates.COMMIT_MERGE_ONGOING)}
          </li>
      </ul>
    );
  }
}

function mapStateToProps(state) {
  return {
    recordsAreFromDuplicateDatabase: state.getIn(['duplicateDatabase', 'currentPair']).size !== 0,
    duplicateDatabaseStatus: state.getIn(['duplicateDatabase', 'status']),
    duplicatePairCount: state.getIn(['duplicateDatabase', 'count']),
    mergedRecord: (state.getIn(['mergedRecord', 'record'])),
    mergeButtonEnabled: mergeButtonEnabled(state),
  };
}

export const ToolBarContainer = connect(
  mapStateToProps,
  _.assign({}, duplicateDatabaseActionCreators, uiActionCreators)
)(ToolBar);

