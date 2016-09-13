import React from 'react';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
import '../../styles/components/navbar.scss';

export class NavBar extends React.Component {
  static propTypes = {
    commitMerge: React.PropTypes.func.isRequired,
    mergeStatus: React.PropTypes.string,
    statusInfo: React.PropTypes.string
  }

  disableIfMergeNotPossible() {
    return this.props.mergeStatus === 'COMMIT_MERGE_AVAILABLE' ? '' : 'disabled';
  }

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
              <li><div className="status-info">{this.props.statusInfo}</div></li>
            
              <li><button className="waves-effect waves-light btn" disabled={this.disableIfMergeNotPossible()} onClick={this.props.commitMerge} name="commit_merge">Yhdistä</button></li>
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

function mapStateToProps(state) {
  return {
    mergeStatus: state.getIn(['mergeStatus', 'status']),
    statusInfo: state.getIn(['mergeStatus', 'message'])
  };
}

export const NavBarContainer = connect(
  mapStateToProps,
  uiActionCreators
)(NavBar);
