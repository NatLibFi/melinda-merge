import React from 'react';
import { commitMerge} from '../ui-actions';
import {connect} from 'react-redux';
import { mergeButtonEnabled } from '../selectors/merge-status-selector';
import '../../styles/components/navbar.scss';
import { removeSession } from 'commons/action-creators/session-actions';

export class NavBar extends React.Component {

  static propTypes = {
    commitMerge: React.PropTypes.func.isRequired,
    mergeStatus: React.PropTypes.string,
    statusInfo: React.PropTypes.string,
    mergeButtonEnabled: React.PropTypes.bool.isRequired,
    removeSession: React.PropTypes.func.isRequired,
  }

  componentDidMount() {
    
    window.$('.dropdown-navbar').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false,
      hover: false,
      gutter: 0,
      belowOrigin: true,
      alignment: 'right'
    });

  }

  disableIfMergeNotPossible() {
    return this.props.mergeButtonEnabled ? '' : 'disabled';
  }

  statusInfo() {
    return this.props.mergeStatus === 'COMMIT_MERGE_ERROR' ? 'Tietueiden tallentamisessa tapahtui virhe' : this.props.statusInfo;
  }

  render() {

    return (
    <div className="navbar-fixed">
        <nav> 
          <div className="nav-wrapper">
            
            <ul id="nav" className="right">
              <li><div className="status-info">{this.props.statusInfo}</div></li>
              <li><button className="waves-effect waves-light btn" disabled={this.disableIfMergeNotPossible()} onClick={this.props.commitMerge} name="commit_merge">Yhdistä</button></li>
              <li><a className="dropdown-navbar dropdown-button-menu" href="#" data-activates="mainmenu"><i className="material-icons">more_vert</i></a></li>
            </ul>
          </div>
        </nav>

        <ul id='mainmenu' className='dropdown-content'>
          <li className="divider" />
          <li><a href="#" onClick={this.props.removeSession}>Kirjaudu ulos</a></li>
        </ul>
      </div>
    );
  }
} 

function mapStateToProps(state) {
  return {
    mergeButtonEnabled: mergeButtonEnabled(state),
    mergeStatus: state.getIn(['mergeStatus', 'status']),
    statusInfo: state.getIn(['mergeStatus', 'message'])
  };
}

export const NavBarContainer = connect(
  mapStateToProps,
  { removeSession, commitMerge }
)(NavBar);
