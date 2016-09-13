import React from 'react';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';

export class NavBar extends React.Component {

  static propTypes = {
    removeSession: React.PropTypes.func.isRequired,
  }

  componentDidMount() {
    
    window.$('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: true, // Displays dropdown below the button
      alignment: 'right' // Displays dropdown with edge aligned to the left of button
    });

  }

  render() {
    return (
      <div className="navbar-fixed">
        <nav> 
          <div className="nav-wrapper">
            
            <ul id="nav" className="right">
            
              <li><a className="waves-effect waves-light btn" href="#">Yhdistä</a></li>
              <li><a className="dropdown-button dropdown-button-menu" href="#" data-activates="mainmenu"><i className="material-icons">more_vert</i></a></li>
            </ul>

          </div>
        </nav>


      <ul id='mainmenu' className='dropdown-content'>
        <li><a href="#">Ohjeet</a></li>        
        <li className="divider" />
        <li><a href="#" onClick={this.props.removeSession}>Kirjaudu ulos</a></li>
      </ul>
      </div>
    );
  }
} 

function mapStateToProps() {
  return {
  };
}

export const NavBarContainer = connect(
  mapStateToProps,
  uiActionCreators
)(NavBar);
