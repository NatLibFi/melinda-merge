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
import '../../styles/components/error-message-panel.scss';

export class ErrorMessagePanel extends React.Component {

  static propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    messageList: PropTypes.array
  }

  renderTitle() {
    return <div className="heading">{this.props.title}</div>;
  }

  renderMessage() {
    return <p>{this.props.message}</p>;
  }

  renderMessageList() {
    return <pre>{this.props.messageList.join('\n')}</pre>;
  }

  render() {
    return (
      <div className="red lighten-2 error-message-panel">
        { this.props.title ? this.renderTitle() : null }
        { this.props.message ? this.renderMessage() : null }
        { this.props.messageList ? this.renderMessageList() : null }
        
      </div>
    );
  }
}
