import React from 'react';
import '../../styles/components/toolbar.scss';
import { DuplicateDatabaseControls } from './duplicate-database-controls';
import {connect} from 'react-redux';
import * as uiActionCreators from '../ui-actions';

export class ToolBar extends React.Component {

  noop() {
    console.log('noop');
  }

  startNewPair(event) {
    event.preventDefault();
    console.log('new pair clicked');
  }

  renderNewPairButton() {
    return (
      <div className="group">
        <ul id="nav">
          <li><a href="#" onClick={(e) => this.startNewPair(e)}><i className="material-icons tooltip" title="Aloita uusi">add</i></a></li>
        </ul>
        <span className="group-label">Uusi</span>
      </div>
    );
  }

  render() {
    return (
      <nav className="toolbar">
        <div className="nav-wrapper">
          {this.renderNewPairButton()}

          <ul><li className="separator"><span /></li></ul>

          <DuplicateDatabaseControls 
            loadNextPair={this.noop}
            skipPair={this.noop}
            notDuplicate={this.noop}
            pairsInDublicateDatabase="33422"
          />
          
        </div>
      </nav>
    );
  }
}

function mapStateToProps(state) {
  return {
    mergeStatus: state.getIn(['mergeStatus', 'status']),
    statusInfo: state.getIn(['mergeStatus', 'message'])
  };
}

export const ToolBarContainer = connect(
  mapStateToProps,
  uiActionCreators
)(ToolBar);
