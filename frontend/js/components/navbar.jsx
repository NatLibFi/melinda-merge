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
import { commitMerge, closeMergeDialog } from '../ui-actions';
import {connect} from 'react-redux';
import { mergeButtonEnabled } from '../selectors/merge-status-selector';

import { removeSession } from 'commons/action-creators/session-actions';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Menu, { MenuItem } from 'material-ui/Menu';
import IconButton from 'material-ui/IconButton';
import Icon from 'material-ui/Icon';
import { withStyles } from 'material-ui/styles';
import MergeDialog from './merge-dialog';

const styles = (theme) => ({
  toolbar: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  statusInfo: {
    marginRight: theme.spacing.unit
  }
});

export class NavBar extends React.Component {

  static propTypes = {
    commitMerge: PropTypes.func.isRequired,
    mergeStatus: PropTypes.string,
    statusInfo: PropTypes.string,
    mergeButtonEnabled: PropTypes.bool.isRequired,
    removeSession: PropTypes.func.isRequired,
    mergeDialog: PropTypes.object.isRequired,
    closeMergeDialog: PropTypes.func.isRequired,
    mergeResponseMessage: PropTypes.string,
    mergeResponse: PropTypes.object,
    classes: PropTypes.object.isRequired
  }

  constructor() {
    super();

    this.state = {
      anchorEl: null
    };
  }
 
  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleLogOut = () => {
    this.handleClose();
    this.props.removeSession();
  }

  disableIfMergeNotPossible() {
    return !this.props.mergeButtonEnabled;
  }

  statusInfo() {
    return this.props.mergeStatus === 'COMMIT_MERGE_ERROR' ? 'Tietueiden tallentamisessa tapahtui virhe' : this.props.statusInfo;
  }

  closeDialog() {
    this.props.closeMergeDialog();
  }

  renderMergeDialog() {
    return (
      <MergeDialog 
        status={this.props.mergeStatus}
        message={this.props.mergeResponseMessage} 
        closable={this.props.mergeDialog.closable}
        response={this.props.mergeResponse}
        onClose={this.closeDialog.bind(this)}
        anchorEl={this.mergeButton}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open
      />
    );
  }

  render() {
    const { anchorEl } = this.state;
    const { classes } = this.props;
    const open = Boolean(anchorEl);

    return (
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <Typography color="inherit" className={classes.statusInfo}>
            {this.props.statusInfo}
          </Typography>
          <Button variant="raised" disabled={this.disableIfMergeNotPossible()} onClick={this.props.commitMerge} color="secondary" buttonRef={(ref) => this.mergeButton = ref}>Yhdistä</Button>

          <IconButton
            aria-owns={open ? 'menu-navbar' : null}
            aria-haspopup="true"
            onClick={this.handleMenu}
            color="inherit"
          >
            <Icon>more_vert</Icon>
          </IconButton>

          <Menu
            id="menu-navbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            getContentAnchorEl={null}
            open={open}
            onClose={this.handleClose}
          >
            <MenuItem onClick={this.handleLogOut}>Kirjaudu ulos</MenuItem>
          </Menu>
          { this.props.mergeDialog.visible ? this.renderMergeDialog() : null }

        </Toolbar>
      </AppBar>
    );
  }
}

function mapStateToProps(state) {
  return {
    mergeButtonEnabled: mergeButtonEnabled(state),
    mergeResponseMessage: state.getIn(['mergeStatus', 'message']),
    mergeResponse: state.getIn(['mergeStatus', 'response']),
    mergeDialog: state.getIn(['mergeStatus', 'dialog']).toJS(),
    mergeStatus: state.getIn(['mergeStatus', 'status']),
    statusInfo: state.getIn(['mergeStatus', 'message'])
  };
}

export const NavBarContainer = connect(
  mapStateToProps,
  { removeSession, commitMerge, closeMergeDialog }
)(withStyles(styles)(NavBar));
