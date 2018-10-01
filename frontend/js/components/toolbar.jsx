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
import '../../styles/components/toolbar.scss';
import { DuplicateDatabaseControls } from './duplicate-database-controls';
import {connect} from 'react-redux';
import * as uiActionCreators from '../ui-actions';
import * as duplicateDatabaseActionCreators from '../action-creators/duplicate-database-actions';
import _ from 'lodash';

export class ToolBar extends React.Component {

  static propTypes = {
    resetWorkspace: PropTypes.func.isRequired,
    fetchCount: PropTypes.func.isRequired,
    fetchNextPair: PropTypes.func.isRequired,
    skipPair: PropTypes.func.isRequired,
    markAsNotDuplicate: PropTypes.func.isRequired,
    duplicatePairCount: PropTypes.number.isRequired,
    duplicateDatabaseStatus: PropTypes.string.isRequired,
    recordsAreFromDuplicateDatabase: PropTypes.bool.isRequired
  }

  UNSAFE_componentWillMount() {
    this.props.fetchCount();
  }

  startNewPair(event) {
    event.preventDefault();
    this.props.resetWorkspace();
  }

  renderNewPairButton() {
    return (
      <div className="group">
        <ul id="nav">
          <li><a href="#" onClick={(e) => this.startNewPair(e)}><i className="material-icons tooltip" title="Aloita uusi">add</i></a></li>
        </ul>
        <span className="group-label">Uusi</span>
      </div>
    );
  }

  render() {
    return (
      <nav className="toolbar">
        <div className="nav-wrapper">
          {this.renderNewPairButton()}

          <ul><li className="separator"><span /></li></ul>

          <DuplicateDatabaseControls 
            currentStatus={this.props.duplicateDatabaseStatus}
            loadNextPair={this.props.fetchNextPair}
            skipPair={this.props.skipPair}
            notDuplicate={this.props.markAsNotDuplicate}
            duplicatePairCount={this.props.duplicatePairCount}
            recordsAreFromDuplicateDatabase={this.props.recordsAreFromDuplicateDatabase}
          />
          
        </div>
      </nav>
    );
  }
}

function mapStateToProps(state) {
  return {
    recordsAreFromDuplicateDatabase: state.getIn(['duplicateDatabase', 'currentPair']).size !== 0,
    duplicateDatabaseStatus: state.getIn(['duplicateDatabase', 'status']),
    duplicatePairCount: state.getIn(['duplicateDatabase', 'count'])
  };
}

export const ToolBarContainer = connect(
  mapStateToProps,
  _.assign({}, duplicateDatabaseActionCreators, uiActionCreators)
)(ToolBar);
