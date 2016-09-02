import React from 'react';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';

export class NavBar extends React.Component {
  static propTypes = {
    commitMerge: React.PropTypes.func.isRequired
  }

  render() {
    return (
      <div className="navbar-fixed">
        <nav> 
          <div className="nav-wrapper">
            
            <ul id="nav" className="right">
            
              <li><a className="waves-effect waves-light btn" href="#" onClick={this.props.commitMerge}>Yhdistä</a></li>
              <li><a className="dropdown-button dropdown-button-menu" href="#!" data-activates="dropdown1"><i className="material-icons">more_vert</i></a></li>
            </ul>

          </div>
        </nav>
      </div>
    );
  }
}

function mapStateToProps() {
  return {
    // prop to be used for disabling the merge button while the action is ongoing
  };
}

export const NavBarContainer = connect(
  mapStateToProps,
  uiActionCreators
)(NavBar);

