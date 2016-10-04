import React from 'react';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
import '../../styles/components/navbar.scss';
import _ from 'lodash';
import { List } from 'immutable';

export class NavBar extends React.Component {
  static propTypes = {
    commitMerge: React.PropTypes.func.isRequired,
    mergeStatus: React.PropTypes.string,
    statusInfo: React.PropTypes.string,
    sourceSubrecords: React.PropTypes.array.isRequired,
    targetSubrecords: React.PropTypes.array.isRequired,
    selectedActions: React.PropTypes.array.isRequired,
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
      belowOrigin: true,
      alignment: 'right'
    });

  }

  disableIfMergeNotPossible() {
    
    const { sourceSubrecords, targetSubrecords, selectedActions} = this.props;
    const undefinedActions = _.findIndex(_.zip(sourceSubrecords.toJS(), targetSubrecords.toJS(), selectedActions.toJS()), ([source, target, action]) => {
      return action === undefined && (source !== undefined || target !== undefined);
    });

    if (undefinedActions !== -1) {
      return 'disabled';
    }

    return this.props.mergeStatus === 'COMMIT_MERGE_AVAILABLE' ? '' : 'disabled';
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
              <li><a className="dropdown-button dropdown-button-menu" href="#" data-activates="mainmenu"><i className="material-icons">more_vert</i></a></li>
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
    mergeStatus: state.getIn(['mergeStatus', 'status']),
    statusInfo: state.getIn(['mergeStatus', 'message']),
    sourceSubrecords: state.getIn(['sourceRecord', 'subrecords'], List()),
    targetSubrecords: state.getIn(['targetRecord', 'subrecords'], List()),
    selectedActions: state.getIn(['subrecordActions'], List())
  };
}

export const NavBarContainer = connect(
  mapStateToProps,
  uiActionCreators
)(NavBar);
