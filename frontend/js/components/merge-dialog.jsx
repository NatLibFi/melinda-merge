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
import _ from 'lodash';
import classNames from 'classnames';
import { CommitMergeStates } from '../constants';
// import '../../styles/components/merge-dialog.scss';
import Popover from 'material-ui/Popover';
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';
import { CardHeader, CardContent, CardActions } from 'material-ui/Card';
import { Preloader } from 'commons/components/preloader';
import { green, red, lime, lightBlue } from 'material-ui/colors';
const styles = (theme) => ({
  root: {
    width: '33.3333%',
    marginTop: theme.spacing.unit
  },
  code: {
    padding: 2,
    marginRight: 3
  },
  message: {
    marginBottom: '3px',
    border: '1px solid #9F9F9F',
    borderRadius: '5px',
    padding: '5px',
    maxHeight: '700px',
    overflowY: 'auto'
  },
  green: {
    backgroundColor: green[100]
  },
  red: {
    backgroundColor: red[50]
  },
  lime: {
    backgroundColor: lime[100]
  },
  lightBlue: {
    backgroundColor: lightBlue[50]
  }
});

class MergeDialog extends React.Component {
  static propTypes = {
    closable: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    status: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    response: PropTypes.object,
    classes: PropTypes.object.isRequired
  }

  close = (onClose) =>  {
    return (e) => {
      e.preventDefault();
      if (this.props.closable) {
        onClose();
      }
    };
  }

  title() {
    switch(this.props.status) {
      case CommitMergeStates.COMMIT_MERGE_ONGOING: return 'Tietueita yhdistetään';
      case CommitMergeStates.COMMIT_MERGE_ERROR: return 'Virhe tietueiden yhdistämisessä';
      case CommitMergeStates.COMMIT_MERGE_COMPLETE: return 'Tietueet yhdistetty';
    }
    return '';
  }

  renderResponseMessages(response) {
    const { classes } = this.props;

    if (_.isEmpty(response)) {
      return <div className={classNames(classes.message, classes.red)}>Tuntematon virhe</div>;
    }
    
    if (response.name === 'RollbackError') {
      return <div className={classNames(classes.message, classes.red)}>{response.message}</div>;
    }

    const triggers = response.triggers.filter(usefulMessage).map((item, i) => this.renderSingleMessage(item, i));
    const warnings = response.warnings.filter(usefulMessage).map((item, i) => this.renderSingleMessage(item, i));
    const errors = response.errors.map((item, i) => this.renderSingleMessage(item, i));
    const messages = response.messages.map((item, i) => this.renderSingleMessage(item, i));

    return (
      <React.Fragment>
        {messages.length ? <div className={classNames(classes.message, classes.green)}>{messages}</div> : null}
        {errors.length   ? <div className={classNames(classes.message, classes.red)}>{errors}</div> : null}
        {warnings.length ? <div className={classNames(classes.message, classes.lime)}>{warnings}</div> : null}
        {triggers.length ? <div className={classNames(classes.message, classes.lightBlue)}>{triggers}</div> : null}
      </React.Fragment>
    );

    function usefulMessage(message) {
      return message.code !== '0121' && message.code !== '0101';
    }
  }

  renderSingleMessage(item, i) {
    const { classes } = this.props;

    return (
      <div key={`${item.message}-${i}`}><span className={classes.code}>{item.code}</span><span>{item.message}</span></div>
    );
  }

  renderContent(status, message, response) {

    if (response) {
      return this.renderResponseMessages(response);
    } else if (status === CommitMergeStates.COMMIT_MERGE_ONGOING) {
      return <div>{this.renderSpinner()}</div>;
    } else {
      return <p>{message}</p>;
    }
  }

  renderSpinner() {
    return <Preloader/>;
  }

  render() {
    const { classes, status, message, closable, response, onClose, ...other } = this.props; 

    return (
      <Popover {...other} classes={{paper: classes.root}} open>
        <CardHeader title={this.title()} />

        <CardContent>
          {this.renderContent(status, message, response)}
        </CardContent>

        <CardActions>
          <Button disabled={!closable} onClick={this.close(onClose)}>Sulje</Button>
        </CardActions>
      </Popover>
    );
  }
}
export default withStyles(styles)(MergeDialog);
