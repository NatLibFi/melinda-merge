import React from 'react';

export class NavBar extends React.Component {

  render() {
    return (
      <div className="navbar-fixed">
        <nav> 
          <div className="nav-wrapper">
            
            <ul id="nav" className="right">
            
              <li><a className="waves-effect waves-light btn" href="#">Yhdistä</a></li>
              <li><a className="dropdown-button dropdown-button-menu" href="#!" data-activates="dropdown1"><i className="material-icons">more_vert</i></a></li>
            </ul>

          </div>
        </nav>
      </div>
    );
  }
}
