import React from 'react';
import '../../styles/components/toolbar.scss';
import { DuplicateDatabaseControls } from './duplicate-database-controls';
import {connect} from 'react-redux';
import * as uiActionCreators from '../ui-actions';
import * as duplicateDatabaseActionCreators from '../action-creators/duplicate-database-actions';

export class ToolBar extends React.Component {

  static propTypes = {
    fetchCount: React.PropTypes.func.isRequired,
    duplicatePairCount: React.PropTypes.number.isRequired
  }

  componentWillMount() {
    this.props.fetchCount();
  }

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
            duplicatePairCount={this.props.duplicatePairCount}
          />
          
        </div>
      </nav>
    );
  }
}

function mapStateToProps(state) {
  return {
    duplicatePairCount: state.getIn(['duplicateDatabase', 'count'])
  };
}

export const ToolBarContainer = connect(
  mapStateToProps,
  duplicateDatabaseActionCreators
)(ToolBar);
