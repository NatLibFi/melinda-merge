import React from 'react';
import '../../styles/components/signin-form-panel.scss';

export class SigninFormPanel extends React.Component {

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
            <input id="username" type="text" className="validate" />
            <label htmlFor="username">{usernameLabel}</label>
          </div>

          <div className="col s2 offset-s1 input-field">
            <input id="password" type="password" className="validate" />
            <label htmlFor="password">{passwordLabel}</label>
          </div>

          <div className="spacer" />
          <div className="spacer" />

          <div className="right-align">
            <button className="btn waves-effect waves-light" type="submit" name="action">{signinButtonLabel}
              <i className="material-icons right">send</i>
            </button>
          </div>
        
        </div>
      </div>

    );
  }
}
