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
import { setCompactSubrecordView } from '../../ui-actions';
import {connect} from 'react-redux';

export class SubrecordHeader extends React.Component {

  static propTypes = {
    setCompactSubrecordView: PropTypes.func.isRequired,
    compactSubrecordView: PropTypes.bool.isRequired
  }
  
  toggleCompactView(event) {
    const isEnabled = event.target.checked;

    this.props.setCompactSubrecordView(isEnabled);    
  }

  render() {

    return (
      
      <div className="row subrecord-header">
        <div className="col s4">

          <div className="row">

            <div className="col s4"><h5>Osakohteet</h5></div>
           
          </div>
        </div>

        <div className="col s4" />

        <div className="col s4">
          <p>
            <input 
              type="checkbox" 
              id="compact-subrecords-checkbox" 
              value="compact-subrecords-view"
              className="filled-in"
              checked={this.props.compactSubrecordView} 
              onChange={(e) => this.toggleCompactView(e)}
              ref={(c) => this._compactViewCheckBox = c}
            />
            
            <label htmlFor="compact-subrecords-checkbox">Pienennä käsitellyt osakohteet</label>
          </p>
        </div>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    compactSubrecordView: state.getIn(['ui', 'compactSubrecordView'])
  };
}

export const SubrecordHeaderContainer = connect(
  mapStateToProps,
  { setCompactSubrecordView }
)(SubrecordHeader);



