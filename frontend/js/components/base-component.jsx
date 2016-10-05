import React from 'react';
import '../../styles/main.scss';
import { NavBarContainer } from './navbar';
import { ToolBarContainer } from './toolbar';
import { RecordSelectionControlsContainer } from './record-selection-controls';
import { RecordMergePanelContainer } from './record-merge-panel';
import { SubrecordComponent } from './subrecord-component';
import { SigninFormPanelContainer } from './signin-form-panel';
import {connect} from 'react-redux';
import * as uiActionCreators from '../ui-actions';
import { List } from 'immutable';

export class BaseComponent extends React.Component {

  static propTypes = {
    sessionState: React.PropTypes.string.isRequired,
    shouldRenderSubrecordComponent: React.PropTypes.bool.isRequired
  }

  renderValidationIndicator() {
    return null;
  }

  renderSignin() {
    return this.props.sessionState === 'VALIDATION_ONGOING' ? this.renderValidationIndicator() : <SigninFormPanelContainer />;
  }

  renderSubrecordComponent() {
    return (
      <div>
        <div className='divider' />
        <SubrecordComponent />
      </div>
    );
  }

  renderMainPanel() {
    return (
      <div>
        <NavBarContainer />
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

  const sourceHasSubrecords = state.getIn(['subrecords', 'sourceRecord'], List()).size > 0;
  const targetHasSubrecords = state.getIn(['subrecords', 'targetRecord'], List()).size > 0;

  const shouldRenderSubrecordComponent = sourceHasSubrecords || targetHasSubrecords;

  return {
    sessionState: state.getIn(['session', 'state']),
    shouldRenderSubrecordComponent
  };
}

export const BaseComponentContainer = connect(
  mapStateToProps,
  uiActionCreators
)(BaseComponent);

