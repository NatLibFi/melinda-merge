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
import '../../styles/components/save-button-panel.scss';
import classNames from 'classnames';
import { Preloader } from 'commons/components/preloader';

export class SaveButtonPanel extends React.Component {

  static propTypes = {
    enabled: PropTypes.bool.isRequired,
    error: PropTypes.object,
    status: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired
  }

  handleClick(event) {
    event.preventDefault();
    const {enabled} = this.props;

    if (enabled) {
      this.props.onSubmit();  
    }
  }

  renderMessages() {
    const {error, status} = this.props;

    if (error !== undefined) {
      return (<span className="save-status save-status-error valign">{error.message}</span>);
    }
    if (status === 'UPDATE_SUCCESS') {
      return (<span className="save-status save-status-success valign">Tietue on tallennettu</span>); 
    }
    return null;
  }

  render() {

    const {enabled, status} = this.props;

    const showPreloader = status === 'UPDATE_ONGOING';

    const buttonClasses = classNames('valign', {
      'disabled': !enabled
    });

    return (
      <div className="save-button-panel valign-wrapper">
        <a href="#" className={buttonClasses} onClick={(e) => this.handleClick(e)}>TALLENNA</a>
        
        {showPreloader ? <Preloader size="small" /> : this.renderMessages()}     
        
      </div>
    );
  }
}
