import React from 'react';
import '../../styles/main.scss';
import { NavBarContainer } from './navbar';
import { RecordSelectionControlsContainer } from './record-selection-controls';
import { RecordMergePanelContainer } from './record-merge-panel';
import { SigninFormPanelContainer } from './signin-form-panel';
import {connect} from 'react-redux';
import * as uiActionCreators from '../ui-actions';

export class BaseComponent extends React.Component {

  static propTypes = {
    sessionState: React.PropTypes.string.isRequired
  }

  renderValidationIndicator() {
    return null;
  }

  renderSignin() {
    return this.props.sessionState === 'VALIDATION_ONGOING' ? this.renderValidationIndicator() : <SigninFormPanelContainer />;
  }

  renderMainPanel() {
    return (
      <div>
        <NavBarContainer />
        <RecordSelectionControlsContainer />
        <RecordMergePanelContainer />
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
    sessionState: state.get('sessionState'),
  };
}

export const BaseComponentContainer = connect(
  mapStateToProps,
  uiActionCreators
)(BaseComponent);

