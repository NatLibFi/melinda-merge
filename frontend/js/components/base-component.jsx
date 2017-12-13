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
import '../../styles/main.scss';
import { NavBarContainer } from './navbar';
import { ToolBarContainer } from './toolbar';
import { RecordSelectionControlsContainer } from './record-selection-controls';
import { RecordMergePanelContainer } from './record-merge-panel';
import { SubrecordComponent } from './subrecord/subrecord-component';
import { SigninFormPanelContainer } from 'commons/components/signin-form-panel';
import {connect} from 'react-redux';
import * as uiActionCreators from '../ui-actions';
import { MergeDialog } from './merge-dialog';
import { eitherHasSubrecords } from '../selectors/subrecord-selectors';

export class BaseComponent extends React.Component {

  static propTypes = {
    sessionState: PropTypes.string,
    shouldRenderSubrecordComponent: PropTypes.bool.isRequired,
    mergeDialog: PropTypes.object.isRequired,
    closeMergeDialog: PropTypes.func.isRequired,
    mergeResponseMessage: PropTypes.string,
    mergeStatus: PropTypes.string.isRequired,
    mergeResponse: PropTypes.object,
  }

  renderValidationIndicator() {
    return null;
  }

  renderSignin() {   
    return this.props.sessionState === 'VALIDATION_ONGOING' ? this.renderValidationIndicator() : <SigninFormPanelContainer title='Merge' />;
  }

  renderSubrecordComponent() {
    return (
      <div>
        <div className='divider' />
        <SubrecordComponent />
      </div>
    );
  }

  closeDialog() {
    this.props.closeMergeDialog();
  }

  renderMergeDialog() {
    return (
      <MergeDialog 
        status={this.props.mergeStatus} 
        message={this.props.mergeResponseMessage} 
        closable={this.props.mergeDialog.closable}
        response={this.props.mergeResponse}
        onClose={this.closeDialog.bind(this)}
      />
    );
  }

  renderMainPanel() {
  
    return (
      <div>
        <NavBarContainer />
        { this.props.mergeDialog.visible ? this.renderMergeDialog() : null }
        <ToolBarContainer />
        <RecordSelectionControlsContainer />
        <RecordMergePanelContainer />
        { this.props.shouldRenderSubrecordComponent ? this.renderSubrecordComponent() : ''}
      </div>
    );
  }

  render() {

    if (this.props.sessionState == 'SIGNIN_OK') {
      return this.renderMainPanel();
    } else if (this.props.sessionState == 'VALIDATION_ONGOING') {
      return this.renderValidationIndicator();
    } else {
      return this.renderSignin();
    }

  }
}

function mapStateToProps(state) {

  return {
    sessionState: state.getIn(['session', 'state']),
    mergeStatus: state.getIn(['mergeStatus', 'status']),
    mergeResponseMessage: state.getIn(['mergeStatus', 'message']),
    mergeResponse: state.getIn(['mergeStatus', 'response']),
    mergeDialog: state.getIn(['mergeStatus', 'dialog']).toJS(),
    shouldRenderSubrecordComponent: eitherHasSubrecords(state)
  };
}

export const BaseComponentContainer = connect(
  mapStateToProps,
  uiActionCreators
)(BaseComponent);

