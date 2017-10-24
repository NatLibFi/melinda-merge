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
import { commitMerge} from '../ui-actions';
import {connect} from 'react-redux';
import { mergeButtonEnabled } from '../selectors/merge-status-selector';
import '../../styles/components/navbar.scss';
import { removeSession } from 'commons/action-creators/session-actions';

export class NavBar extends React.Component {

  static propTypes = {
    commitMerge: React.PropTypes.func.isRequired,
    mergeStatus: React.PropTypes.string,
    statusInfo: React.PropTypes.string,
    mergeButtonEnabled: React.PropTypes.bool.isRequired,
    removeSession: React.PropTypes.func.isRequired,
  }

  componentDidMount() {
    
    window.$('.dropdown-navbar').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false,
      hover: false,
      gutter: 0,
      belowOrigin: true,
      alignment: 'right'
    });

  }

  disableIfMergeNotPossible() {
    return this.props.mergeButtonEnabled ? '' : 'disabled';
  }

  statusInfo() {
    return this.props.mergeStatus === 'COMMIT_MERGE_ERROR' ? 'Tietueiden tallentamisessa tapahtui virhe' : this.props.statusInfo;
  }

  render() {

    return (
    <div className="navbar-fixed">
        <nav> 
          <div className="nav-wrapper">
            
            <ul id="nav" className="right">
              <li><div className="status-info">{this.props.statusInfo}</div></li>
              <li><button className="waves-effect waves-light btn" disabled={this.disableIfMergeNotPossible()} onClick={this.props.commitMerge} name="commit_merge">Yhdistä</button></li>
              <li><a className="dropdown-navbar dropdown-button-menu" href="#" data-activates="mainmenu"><i className="material-icons">more_vert</i></a></li>
            </ul>
          </div>
        </nav>

        <ul id='mainmenu' className='dropdown-content'>
          <li className="divider" />
          <li><a href="#" onClick={this.props.removeSession}>Kirjaudu ulos</a></li>
        </ul>
      </div>
    );
  }
} 

function mapStateToProps(state) {
  return {
    mergeButtonEnabled: mergeButtonEnabled(state),
    mergeStatus: state.getIn(['mergeStatus', 'status']),
    statusInfo: state.getIn(['mergeStatus', 'message'])
  };
}

export const NavBarContainer = connect(
  mapStateToProps,
  { removeSession, commitMerge }
)(NavBar);
