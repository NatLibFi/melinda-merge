import React from 'react';
import '../../styles/components/signin-form-panel.scss';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';

export class SigninFormPanel extends React.Component {

  static propTypes = {
    startSession: React.PropTypes.func.isRequired
  }
  constructor() {
    super();

    this.state = {};
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
         
          <div className="col s2 offset-s1 input-field">
            <input id="username" type="text" className="validate" onChange={this.updateUsername.bind(this)}/>
            <label htmlFor="username">{usernameLabel}</label>
          </div>

          <div className="col s2 offset-s1 input-field">
            <input id="password" type="password" className="validate" onChange={this.updatePassword.bind(this)}/>
            <label htmlFor="password">{passwordLabel}</label>
          </div>

          <div className="spacer" />
          <div className="spacer" />

          <div className="right-align">
            <button className="btn waves-effect waves-light" type="submit" name="action" onClick={this.executeSignin.bind(this)}>{signinButtonLabel}
              <i className="material-icons right">send</i>
            </button>
          </div>
        
        </div>
      </div>

    );
  }
  updateUsername(event) {
    this.setState({username: event.target.value});
  }
  updatePassword(event) {
    this.setState({password: event.target.value});
  }
  executeSignin() {
 
    const {username, password} = this.state;
    window.x = this.props;
    this.props.startSession(username, password);

  }
}

export const SigninFormPanelContainer = connect(
  null,
  uiActionCreators
)(SigninFormPanel);

