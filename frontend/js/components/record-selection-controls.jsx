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
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
import _ from 'lodash';
import { withRouter } from 'react-router';
import classNames from 'classnames';
import { hostRecordActionsEnabled } from '../selectors/merge-status-selector';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Icon from 'material-ui/Icon';
import { withStyles } from 'material-ui/styles';

const RECORD_LOADING_DELAY = 500;

const styles = (theme) => ({
  root: {
    margin: (theme.spacing.unit * 2) + 'px 0'
  },
  swapButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  swapButton: {
    height: '36px',
    width: '36px'
  }
});

export class RecordSelectionControls extends React.Component {

  static propTypes = {
    sourceRecordId: PropTypes.string.isRequired,
    targetRecordId: PropTypes.string.isRequired,
    fetchRecord: PropTypes.func.isRequired,
    swapRecords: PropTypes.func.isRequired,
    setSourceRecordId: PropTypes.func.isRequired,
    setTargetRecordId: PropTypes.func.isRequired,
    locationDidChange: PropTypes.func.isRequired,
    controlsEnabled: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
  }

  constructor() {
    super();
    this.handleSourceChangeDebounced = _.debounce((event) => {
      this.props.fetchRecord(event.target.value, 'SOURCE');
    }, RECORD_LOADING_DELAY);

    this.handleTargetChangeDebounced = _.debounce((event) => {
      this.props.fetchRecord(event.target.value, 'TARGET');
    }, RECORD_LOADING_DELAY);
  }

  componentWillMount() {
    this.unlisten = this.props.history.listen(location => this.props.locationDidChange(location));
    this.props.locationDidChange(this.props.history.location);
  }

  componentWillReceiveProps(next) {
    if (next.targetRecordId === this.props.targetRecordId && next.sourceRecordId === this.props.sourceRecordId) return;

    if (_.identity(next.targetRecordId) && _.identity(next.sourceRecordId)) {
      this.props.history.push(`/records/${next.sourceRecordId}/and/${next.targetRecordId}`);
    }
  }

  handleChange(event) {
    const { controlsEnabled } = this.props;
    if (!controlsEnabled) {
      return;
    }

    event.persist();
    
    if (event.target.id === 'source_record') {
      this.props.setSourceRecordId(event.target.value);
      this.handleSourceChangeDebounced(event);
    }
    if (event.target.id === 'target_record') {
      this.props.setTargetRecordId(event.target.value);
      this.handleTargetChangeDebounced(event);
    }
  }

  handleSwap() {
    const { controlsEnabled } = this.props;

    if (controlsEnabled) {
      this.props.swapRecords();
    }
  }

  render() {
    const { controlsEnabled, classes } = this.props;

    return (
      <Grid container className={classNames(classes.root, 'record-selection-controls')} spacing={0}>
        <Grid item xs={1} />

        <Grid item xs={2}>
          <TextField id="source_record" type="tel" value={this.props.sourceRecordId} onChange={this.handleChange.bind(this)} disabled={!controlsEnabled} label="Poistuva tietue" />
        </Grid>

        <Grid item xs={2} className={classes.swapButtonContainer}>
          <Button classes={{root: classes.swapButton}} variant="fab" color="secondary" aria-label="swap" disabled={!controlsEnabled} onClick={(e) => this.handleSwap(e)}>
            <Icon>swap_horiz</Icon>
          </Button>
        </Grid>

        <Grid item xs={2}>
          <TextField id="target_record" type="tel" value={this.props.targetRecordId} onChange={this.handleChange.bind(this)} disabled={!controlsEnabled} label="Säilyvä tietue" />
        </Grid>

      </Grid>
    );
  }
}

function mapStateToProps(state) {
  return {
    sourceRecordId: state.getIn(['sourceRecord', 'id']) || '',
    targetRecordId: state.getIn(['targetRecord', 'id']) || '',
    controlsEnabled: hostRecordActionsEnabled(state)
  };
}

export const RecordSelectionControlsContainer = withRouter(connect(
  mapStateToProps,
  uiActionCreators
)(withStyles(styles)(RecordSelectionControls)));
