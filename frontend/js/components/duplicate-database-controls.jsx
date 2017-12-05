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
import { DuplicateDatabaseStates } from '../constants';
import classNames from 'classnames';

export class DuplicateDatabaseControls extends React.Component {

  static propTypes = {
    loadNextPair: PropTypes.func.isRequired,
    skipPair: PropTypes.func.isRequired,
    notDuplicate: PropTypes.func.isRequired,
    duplicatePairCount: PropTypes.number.isRequired,
    currentStatus: PropTypes.string.isRequired,
    recordsAreFromDuplicateDatabase: PropTypes.bool.isRequired
  }

  loadNextDuplicatePair(event) {
    event.preventDefault();
    if (this.props.currentStatus === DuplicateDatabaseStates.READY) {
      this.props.loadNextPair();
    }
  }

  skipCurrentDuplicatePair(event) {
    event.preventDefault();
    if (this.props.currentStatus === DuplicateDatabaseStates.READY) {
      this.props.skipPair(event);
    }
  }

  markAsNonDuplicate(event) {
    event.preventDefault();
    if (this.props.currentStatus === DuplicateDatabaseStates.READY) {
      this.props.notDuplicate(event);
    }
  }

  renderDuplicateCountBadge() {
    const count = this.props.duplicatePairCount;

    return count > 0 ? (<span className="badge tooltip" title="Tuplaehdotukset">{count}</span>) : null;
  }

  renderProgressIndicatorFor(action) {
  
    return this.props.currentStatus === action ? <div className="progress"><div className="indeterminate" /></div> : null;
  }

  isEnabled() {
    return this.props.currentStatus === DuplicateDatabaseStates.READY;
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
    

    const classes = classNames('material-icons', 'tooltip');

    return (
      <div className="group">
        <ul id="nav">
          
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
          
        </ul>
        <span className="group-label">Tuplatietokanta {this.renderDuplicateCountBadge()}</span>
      </div>
    );
  }
}

