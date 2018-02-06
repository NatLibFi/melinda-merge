/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records
*
* Copyright (C) 2015-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of marc-merge-ui
*
* marc-merge-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* marc-merge-ui is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import DuplicateDatabaseControls from './duplicate-database-controls';
import {connect} from 'react-redux';
import * as uiActionCreators from '../ui-actions';
import * as duplicateDatabaseActionCreators from '../action-creators/duplicate-database-actions';
import _ from 'lodash';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import Icon from 'material-ui/Icon';
import Divider from 'material-ui/Divider';

const styles = theme => ({
  root: {
    backgroundColor: '#ededed',
    boxShadow: 'none',
    borderBottom: '1px solid #ddd',
    display: 'flex'
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  groupButtons: {
    display: 'flex'
  },
  groupLabel: {
    color: 'black'
  },
  groupLabelBadge: {
    position: 'static',
    fontWeight: 300,
    fontSize: '0.8rem',
    color: '#fff',
    backgroundColor: '#26a69a',
    borderRadius: '2px'
  },
  button: {
    textAlign: 'center',
    flex: '0 0 auto',
    width: theme.spacing.unit * 6,
    height: theme.spacing.unit * 6,
    padding: 0,
    color: theme.palette.action.active,
    transition: theme.transitions.create('background-color', {
      duration: theme.transitions.duration.shortest,
    }),
    minWidth: 0
  },
  buttonLabel: {
    width: '100%',
    display: 'flex',
    alignItems: 'inherit',
    justifyContent: 'inherit',
  },
});

export class ToolBar extends React.Component {

  static propTypes = {
    resetWorkspace: PropTypes.func.isRequired,
    fetchCount: PropTypes.func.isRequired,
    fetchNextPair: PropTypes.func.isRequired,
    skipPair: PropTypes.func.isRequired,
    markAsNotDuplicate: PropTypes.func.isRequired,
    duplicatePairCount: PropTypes.number.isRequired,
    duplicateDatabaseStatus: PropTypes.string.isRequired,
    recordsAreFromDuplicateDatabase: PropTypes.bool.isRequired,
    classes: PropTypes.object.isRequired
  }

  componentWillMount() {
    this.props.fetchCount();
  }

  startNewPair(event) {
    event.preventDefault();
    this.props.resetWorkspace();
  }

  renderNewPairButton() {
    const { classes } = this.props;

    return (
      <div className={classes.group}>
        <div className={classes.groupButtons}>
          <Button classes={{root: classes.button, label: classes.buttonLabel}} onClick={(e) => this.startNewPair(e)}><Icon>add</Icon></Button>
        </div>

        <span className={classes.groupLabel}>Uusi</span>
      </div>
    );
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        {this.renderNewPairButton()}
        <Divider/>
        <DuplicateDatabaseControls 
          classes={{
            button: classes.button,
            buttonLabel: classes.buttonLabel,
            group: classes.group,
            groupButtons: classes.groupButtons,
            groupLabel: classes.groupLabel,
            groupLabelBadge: classes.groupLabelBadge
          }}
          currentStatus={this.props.duplicateDatabaseStatus}
          loadNextPair={this.props.fetchNextPair}
          skipPair={this.props.skipPair}
          notDuplicate={this.props.markAsNotDuplicate}
          duplicatePairCount={this.props.duplicatePairCount}
          recordsAreFromDuplicateDatabase={this.props.recordsAreFromDuplicateDatabase}
        />
      </div>
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
)(withStyles(styles)(ToolBar));
