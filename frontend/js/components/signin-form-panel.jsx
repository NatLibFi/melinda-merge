import React from 'react';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';

import '../../styles/components/signin-form-panel.scss';

export class SigninFormPanel extends React.Component {

  static propTypes = {
    startSession: React.PropTypes.func.isRequired,
    createSessionErrorMessage: React.PropTypes.string,
    sessionState: React.PropTypes.string
  }
  constructor() {
    super();

    this.state = {};
  }

  updateUsername(event) {
    this.setState({username: event.target.value});
  }

  updatePassword(event) {
    this.setState({password: event.target.value});
  }

  executeSignin() {
 
    const {username, password} = this.state;
    this.props.startSession(username, password);

  }

  renderPreloader() {
    return (
      <div className="progress">
        <div className="indeterminate" />
      </div>
    );
  }

  disableDuringSignin() {
    return this.props.sessionState === 'SIGNIN_ONGOING' ? 'disabled':'';
  }

  render() {
    const title = 'marc-merge-ui';
    const usernameLabel = 'Käyttäjätunnus';
    const passwordLabel = 'Salasana';
    const signinButtonLabel = 'Kirjaudu';

    return (

      <div className="card signin-panel valign">
      
        <div className="card-panel teal lighten-2">
          <h4>{title}</h4>
        </div>

        <div className="card-content">
         
          <form>
            <div className="col s2 offset-s1 input-field">
              <input id="username" type="text" className="validate" onChange={this.updateUsername.bind(this)}/>
              <label htmlFor="username">{usernameLabel}</label>
            </div>

            <div className="col s2 offset-s1 input-field">
              <input id="password" type="password" className="validate" onChange={this.updatePassword.bind(this)}/>
              <label htmlFor="password">{passwordLabel}</label>
            </div>

            <div className="spacer" />
            {this.props.sessionState === 'SIGNIN_ERROR' ? this.props.createSessionErrorMessage : <span>&nbsp;</span>}
            <div className="spacer" />

            <div className="right-align">
              <button className="btn waves-effect waves-light" disabled={this.disableDuringSignin()} type="submit" name="action" onClick={this.executeSignin.bind(this)}>{signinButtonLabel}
                <i className="material-icons right">send</i>
              </button>
            </div>
          </form>
        
        </div>

        {this.props.sessionState === 'SIGNIN_ONGOING' ? this.renderPreloader():''}
          
      </div>

    );
  }
}

function mapStateToProps(state) {
  return {
    sessionState: state.get('sessionState'),
    createSessionErrorMessage: state.get('createSessionErrorMessage')
  };
}

export const SigninFormPanelContainer = connect(
  mapStateToProps,
  uiActionCreators
)(SigninFormPanel);

