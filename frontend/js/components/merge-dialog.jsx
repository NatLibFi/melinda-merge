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
import _ from 'lodash';
import classNames from 'classnames';
import { CommitMergeStates } from '../constants';
import '../../styles/components/merge-dialog.scss';

export class MergeDialog extends React.Component {
  static propTypes = {
    closable: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    status: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    response: PropTypes.object,
    statusInfo: PropTypes.string
  }

  close(event) {
    event.preventDefault();
    if (this.props.closable) {
      this.props.onClose();
    }
  }

  title() {
    switch (this.props.status) {
      case CommitMergeStates.COMMIT_MERGE_ONGOING: return 'Tietueita yhdistetään';
      case CommitMergeStates.COMMIT_MERGE_ERROR: return 'Virhe tietueiden yhdistämisessä';
      case CommitMergeStates.COMMIT_MERGE_COMPLETE: return 'Tietueet yhdistetty';
    }
    return '';
  }

  renderResponseMessages(response) {

    if (_.isEmpty(response)) {
      return <div className="response-container"><div className="red lighten-5">Tuntematon virhe</div></div>;
    }

    if (response.name === 'RollbackError') {
      return <div className="response-container"><div className="red lighten-5">{response.message}</div></div>;
    }

    const triggers = response.triggers.filter(usefulMessage).map(this.renderSingleMessage);
    const warnings = response.warnings.filter(usefulMessage).map(this.renderSingleMessage);
    const errors = response.errors.map(this.renderSingleMessage);
    const messages = response.messages.map(this.renderSingleMessage);

    return (
      <div className="response-container">
        {messages.length ? <div className="green lighten-4">{messages}</div> : null}
        {errors.length ? <div className="red lighten-5">{errors}</div> : null}
        {warnings.length ? <div className="lime lighten-4">{warnings}</div> : null}
        {triggers.length ? <div className="light-blue lighten-5">{triggers}</div> : null}
      </div>
    );

    function usefulMessage(message) {
      return message.code !== '0121' && message.code !== '0101';
    }
  }

  renderSingleMessage(item, i) {
    return (
      <div key={`${item.message}-${i}`} className="message-container"><span className="code">{item.code}</span><span className="message">{item.message}</span></div>
    );
  }

  renderContent() {

    if (this.props.response) {
      return this.renderResponseMessages(this.props.response);
    } else if (this.props.status === CommitMergeStates.COMMIT_MERGE_ONGOING) {
      return <div>{this.renderPreloader()}</div>;
    } else {
      return <p>{this.props.message}</p>;
    }
  }

  renderPreloader() {
    return (
      <div className="progress">
        <div className="indeterminate" />
      </div>
    );
  }

  statusInfo() {
    return this.props.status === 'COMMIT_MERGE_ERROR' ? 'Tietueiden tallentamisessa tapahtui virhe' : this.props.statusInfo;
  }

  render() {

    const buttonClasses = classNames({
      disabled: !this.props.closable
    });

    return (
      <div className="row modal-merge-dialog">
        <div className="col offset-s4 s4">
          <div className="card">
            <div className="card-content">
              <span className="card-title">{this.title()}</span>
              {this.renderContent()}
            </div>
            <div className="card-action right-align">
              <a className={buttonClasses} href="#" onClick={(e) => this.close(e)}>
                <i className="material-icons right">close</i>
                Sulje
                </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
