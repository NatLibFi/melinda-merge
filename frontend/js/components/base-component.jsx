import React from 'react';
import '../../styles/main.scss';
import { NavBarContainer } from './navbar';
import { RecordSelectionControlsContainer } from './record-selection-controls';
import { RecordMergePanelContainer } from './record-merge-panel';
import { SigninFormPanelContainer } from './signin-form-panel';
import {connect} from 'react-redux';

export class BaseComponent extends React.Component {

  static propTypes = {
    sessionState: React.PropTypes.string.isRequired
  }

  renderSignin() {
    return <SigninFormPanelContainer />;
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
    return this.props.sessionState !== 'SIGNIN_OK' ? this.renderSignin() : this.renderMainPanel();
  }
}

function mapStateToProps(state) {
  return {
    sessionState: state.get('sessionState'),
  };
}

export const BaseComponentContainer = connect(
  mapStateToProps
)(BaseComponent);

