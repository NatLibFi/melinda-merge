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
import { DuplicateDatabaseStates } from '../constants';
import Button from 'material-ui/Button';
import Icon from 'material-ui/Icon';
import { LinearProgress } from 'material-ui/Progress';
import { withStyles } from 'material-ui/styles';

const styles = (theme) => ({
  button: {
    position: 'relative',
    ...theme.button
  },
  buttonProgress: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    ...theme.buttonProgress
  },
  buttonLabel: {
    ...theme.buttonLabel
  },
  group: {
    ...theme.group
  },
  groupButtons: {
    ...theme.groupButtons
  },
  groupLabel: {
    ...theme.groupLabel
  },
  groupLabelBadge: {
    ...theme.groupLabelBadge
  },
});

class DuplicateDatabaseControls extends React.Component {

  static propTypes = {
    loadNextPair: PropTypes.func.isRequired,
    skipPair: PropTypes.func.isRequired,
    notDuplicate: PropTypes.func.isRequired,
    duplicatePairCount: PropTypes.number.isRequired,
    currentStatus: PropTypes.string.isRequired,
    recordsAreFromDuplicateDatabase: PropTypes.bool.isRequired,
    classes: PropTypes.object.isRequired
  }

  loadNextDuplicatePair(event) {
    event.preventDefault();
    if (this.props.currentStatus === DuplicateDatabaseStates.READY) {
      this.props.loadNextPair();
    }
  }

  skipCurrentDuplicatePair(event) {
    event.preventDefault();
    if (this.props.currentStatus === DuplicateDatabaseStates.READY) {
      this.props.skipPair(event);
    }
  }

  markAsNonDuplicate(event) {
    event.preventDefault();
    if (this.props.currentStatus === DuplicateDatabaseStates.READY) {
      this.props.notDuplicate(event);
    }
  }

  renderDuplicateCountBadge() {
    const { classes } = this.props;

    const count = this.props.duplicatePairCount;

    return count > 0 ? (<span className={classes.groupLabelBadge} title="Tuplaehdotukset">{count}</span>) : null;
  }

  renderProgressIndicatorFor(action) {
    const { classes } = this.props;
    return this.props.currentStatus === action ? <LinearProgress classes={{root: classes.buttonProgress}} /> : null;
  }

  isEnabled() {
    return this.props.currentStatus === DuplicateDatabaseStates.READY;
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.group}>
        <div className={classes.groupButtons}>
          <Button disabled={!this.isEnabled()} classes={{root: classes.button, label: classes.buttonLabel}} onClick={(e) => this.loadNextDuplicatePair(e)} title="Seuraava pari">
            <Icon>navigate_next</Icon>
            {this.renderProgressIndicatorFor(DuplicateDatabaseStates.FETCH_NEXT_DUPLICATE_ONGOING)}
          </Button>
          <Button disabled={!this.isEnabled() || !this.props.recordsAreFromDuplicateDatabase} classes={{root: classes.button, label: classes.buttonLabel}} onClick={(e) => this.skipCurrentDuplicatePair(e)} title="Ohita">
            <Icon>skip_next</Icon>
            {this.renderProgressIndicatorFor(DuplicateDatabaseStates.SKIP_PAIR_ONGOING)}
          </Button>
          <Button disabled={!this.isEnabled() || !this.props.recordsAreFromDuplicateDatabase} classes={{root: classes.button, label: classes.buttonLabel}} onClick={(e) => this.markAsNonDuplicate(e)} title="Ei tupla">
            <Icon>layers_clear</Icon>
            {this.renderProgressIndicatorFor(DuplicateDatabaseStates.MARK_AS_NON_DUPLICATE_ONGOING)}
          </Button>
        </div>

        <span className={classes.groupLabel}>Tuplatietokanta {this.renderDuplicateCountBadge()}</span>
      </div>
    );
  }
}

export default withStyles(styles)(DuplicateDatabaseControls);

