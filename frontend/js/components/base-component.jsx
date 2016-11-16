import React from 'react';
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
    sessionState: React.PropTypes.string,
    shouldRenderSubrecordComponent: React.PropTypes.bool.isRequired,
    mergeDialog: React.PropTypes.object.isRequired,
    closeMergeDialog: React.PropTypes.func.isRequired,
    mergeResponseMessage: React.PropTypes.string,
    mergeStatus: React.PropTypes.string.isRequired,
    mergeResponse: React.PropTypes.object,
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

