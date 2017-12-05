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

import PropTypes from 'prop-types';

import React from 'react';
import * as subrecordActions from '../../action-creators/subrecord-actions';
import {connect} from 'react-redux';
import { SubrecordActionTypes } from '../../constants';
import classNames from 'classnames';

export class SubrecordActionButton extends React.Component {

  static propTypes = {
    rowId: PropTypes.string.isRequired,
    changeSubrecordAction: PropTypes.func.isRequired,
    selectedAction: PropTypes.string,
    isMergeActionAvailable: PropTypes.bool,
    isCopyActionAvailable: PropTypes.bool,
    actionsEnabled: PropTypes.bool
  } 

  componentDidUpdate() {
    window.$ && window.$(this._button).closeFAB();  
  }

  selectAction(type) {
    const {rowId, changeSubrecordAction} = this.props;

    return () => {
      if (this.props.actionsEnabled) {
        changeSubrecordAction(rowId, type);
      }
    };
  }

  getIcon(actionType) {
    if (actionType === SubrecordActionTypes.BLOCK) return 'block';
    if (actionType === SubrecordActionTypes.MERGE) return 'queue';
    if (actionType === SubrecordActionTypes.COPY) return 'forward';
    return 'more_vert';
  }

  getColor(actionType) {
    if (actionType === SubrecordActionTypes.BLOCK) return 'red';
    if (actionType === SubrecordActionTypes.MERGE) return 'green';
    if (actionType === SubrecordActionTypes.COPY) return 'blue';
    return 'yellow'; 
  }

  renderButton(color, icon, onClickFn) {
    const buttonClasses = classNames('btn-floating', color);

    return (
      <a className={buttonClasses}
        onClick={onClickFn} >

        <i className="material-icons">{icon}</i>
      </a>
    );
  }

  renderActionButton(actionType) {
    const color = this.getColor(actionType);
    const icon = this.getIcon(actionType);

    return this.renderButton(color, icon, this.selectAction(actionType));
  }

  renderUnsetButton() {
    return this.renderButton('yellow', 'more_vert', this.selectAction(SubrecordActionTypes.UNSET));
  }

  renderBlockButton() {
    return this.renderButton('red', 'block', this.selectAction(SubrecordActionTypes.BLOCK));
  }

  renderMergeButton() {
    return this.renderButton('green', 'queue', this.selectAction(SubrecordActionTypes.MERGE));
  }

  renderCopyButton() {
    return this.renderButton('blue', 'forward', this.selectAction(SubrecordActionTypes.COPY));
  }

  isActionAvailable(actionType) {
    const {isMergeActionAvailable, isCopyActionAvailable} = this.props;
    if (actionType === SubrecordActionTypes.COPY) return isCopyActionAvailable;
    if (actionType === SubrecordActionTypes.MERGE) return isMergeActionAvailable;
    return true;
  }

  render() {

    const {selectedAction, actionsEnabled} = this.props;

    const {UNSET, BLOCK, MERGE, COPY} = SubrecordActionTypes;

    const buttons = [BLOCK, MERGE, COPY]
      .filter(actionType => this.isActionAvailable(actionType))
      .map(actionType => actionType === selectedAction ? UNSET : actionType)
      .map(actionType => <li key={actionType}>{this.renderActionButton(actionType)}</li>);
   
    const color = this.getColor(selectedAction);
    const selectedIconClasses = classNames('btn-floating', 'btn-small', 'waves-light', 'subrecord-action-button', color, {
      'disabled': !actionsEnabled,
      'waves-effect': actionsEnabled
    });

    const containerClasses = classNames('subrecord-action-button-container', {
      'fixed-action-btn': actionsEnabled,
      'click-to-toggle': actionsEnabled,
      'horizontal': actionsEnabled
    });

    return (
      <div className={containerClasses} ref={(c) => this._button = c}>
        <a className={selectedIconClasses}>
          <i className="large material-icons">{this.getIcon(selectedAction)}</i>
        </a>

        {actionsEnabled ? <ul className="open-left">{ buttons }</ul> : null}

      </div>
    );
  }
}

export const SubrecordActionButtonContainer = connect(
  null,
  subrecordActions
)(SubrecordActionButton);
