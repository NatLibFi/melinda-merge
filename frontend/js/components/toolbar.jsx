import React from 'react';
import '../../styles/components/toolbar.scss';
import { DuplicateDatabaseControls } from './duplicate-database-controls';
import {connect} from 'react-redux';
import * as uiActionCreators from '../ui-actions';
import * as duplicateDatabaseActionCreators from '../action-creators/duplicate-database-actions';
import _ from 'lodash';

export class ToolBar extends React.Component {

  static propTypes = {
    resetWorkspace: React.PropTypes.func.isRequired,
    fetchCount: React.PropTypes.func.isRequired,
    fetchNextPair: React.PropTypes.func.isRequired,
    skipPair: React.PropTypes.func.isRequired,
    markAsNotDuplicate: React.PropTypes.func.isRequired,
    duplicatePairCount: React.PropTypes.number.isRequired,
    duplicateDatabaseStatus: React.PropTypes.string.isRequired,
    recordsAreFromDuplicateDatabase: React.PropTypes.bool.isRequired
  }

  componentWillMount() {
    this.props.fetchCount();
  }

  startNewPair(event) {
    event.preventDefault();
    this.props.resetWorkspace();
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
            currentStatus={this.props.duplicateDatabaseStatus}
            loadNextPair={this.props.fetchNextPair}
            skipPair={this.props.skipPair}
            notDuplicate={this.props.markAsNotDuplicate}
            duplicatePairCount={this.props.duplicatePairCount}
            recordsAreFromDuplicateDatabase={this.props.recordsAreFromDuplicateDatabase}
          />
          
        </div>
      </nav>
    );
  }
}

function mapStateToProps(state) {
  return {
    recordsAreFromDuplicateDatabase: state.getIn(['duplicateDatabase', 'currentPair']).size !== 0,
    duplicateDatabaseStatus: state.getIn(['duplicateDatabase', 'status']),
    duplicatePairCount: state.getIn(['duplicateDatabase', 'count'])
  };
}

export const ToolBarContainer = connect(
  mapStateToProps,
  _.assign({}, duplicateDatabaseActionCreators, uiActionCreators)
)(ToolBar);
