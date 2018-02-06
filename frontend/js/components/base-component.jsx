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
import Notifications from 'react-notification-system-redux';
import _ from 'lodash';
import { NavBarContainer } from './navbar';
import { ToolBarContainer } from './toolbar';
import { RecordSelectionControlsContainer } from './record-selection-controls';
import { RecordMergePanelContainer } from './record-merge-panel';
import { SubrecordComponent } from 'commons/components/subrecord/subrecord-component';
import { SigninFormPanelContainer } from 'commons/components/signin-form-panel';
import {connect} from 'react-redux';
import * as uiActionCreators from '../ui-actions';
import { eitherHasSubrecords, sourceSubrecords, targetSubrecords, subrecordRowsDisplay } from '../selectors/subrecord-selectors';
import { recordSaveActionAvailable, subrecordActionsEnabled } from '../selectors/merge-status-selector';
import { compactRowsMap } from '../selectors/ui-selectors';
import * as subrecordActions from '../action-creators/subrecord-actions';
export class BaseComponent extends React.Component {

  static propTypes = {
    sessionState: PropTypes.string,
    shouldRenderSubrecordComponent: PropTypes.bool.isRequired,
    setCompactSubrecordView: PropTypes.func.isRequired,
    compactSubrecordView: PropTypes.bool.isRequired,
    subrecords: PropTypes.array.isRequired,
    saveButtonVisible: PropTypes.bool.isRequired,
    subrecordActionsEnabled: PropTypes.bool.isRequired,
    insertSubrecordRow: PropTypes.func.isRequired,
    removeSubrecordRow: PropTypes.func.isRequired,
    changeSubrecordAction: PropTypes.func.isRequired,
    changeSubrecordRow: PropTypes.func.isRequired,
    changeSourceSubrecordRow: PropTypes.func.isRequired,
    changeTargetSubrecordRow: PropTypes.func.isRequired,
    expandSubrecordRow: PropTypes.func.isRequired,
    compressSubrecordRow: PropTypes.func.isRequired,
    toggleSourceSubrecordFieldSelection: PropTypes.func.isRequired,
    editMergedSubrecord: PropTypes.func.isRequired,
    saveSubrecord: PropTypes.func.isRequired,
    notifications: PropTypes.array,
    swapEverySubrecordRow: PropTypes.func.isRequired,
    swapSubrecordRow: PropTypes.func.isRequired
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
        <SubrecordComponent
          setCompactSubrecordView={this.props.setCompactSubrecordView}
          compactSubrecordView={this.props.compactSubrecordView}
          subrecords={this.props.subrecords}
          saveButtonVisible={this.props.saveButtonVisible}
          actionsEnabled={this.props.subrecordActionsEnabled}
          onInsertSubrecordRow={this.props.insertSubrecordRow}
          onRemoveSubrecordRow={this.props.removeSubrecordRow}
          onSwapEverySubrecordRow={this.props.swapEverySubrecordRow}
          onSwapSubrecordRow={this.props.swapSubrecordRow}
          onChangeSubrecordAction={this.props.changeSubrecordAction}
          onChangeSubrecordRow={this.props.changeSubrecordRow}
          onChangeSourceSubrecordRow={this.props.changeSourceSubrecordRow}
          onChangeTargetSubrecordRow={this.props.changeTargetSubrecordRow}
          onExpandSubrecordRow={this.props.expandSubrecordRow}
          onCompressSubrecordRow={this.props.compressSubrecordRow}
          onToggleSourceSubrecordFieldSelection={this.props.toggleSourceSubrecordFieldSelection}
          onEditMergedSubrecord={this.props.editMergedSubrecord}
          onSaveSubrecord={this.props.saveSubrecord}
          swappingEnabled
        />
      </div>
    );
  }

  renderMainPanel() {

    return (
      <React.Fragment>
        <Notifications
          notifications={this.props.notifications}
        />
        <NavBarContainer/>
        <ToolBarContainer />
        <RecordSelectionControlsContainer />
        <RecordMergePanelContainer />
        { this.props.shouldRenderSubrecordComponent ? this.renderSubrecordComponent() : ''}
      </React.Fragment>
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

    shouldRenderSubrecordComponent: eitherHasSubrecords(state),
    notifications: state.get('notifications'),

    // Subrecords
    compactSubrecordView: state.getIn(['ui', 'compactSubrecordView']),
    subrecords: subrecordRowsDisplay(state),
    saveButtonVisible: recordSaveActionAvailable(state),
    subrecordActionsEnabled: subrecordActionsEnabled(state),
    compactRowIdMap: compactRowsMap(state),
    preferredSubrecordCount: targetSubrecords(state).length,
    otherSubrecordCount: sourceSubrecords(state).length
  };
}

export const BaseComponentContainer = connect(
  mapStateToProps,
  _.assign({}, uiActionCreators, subrecordActions)
)(BaseComponent);

