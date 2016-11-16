import React from 'react';
import * as subrecordActions from '../../action-creators/subrecord-actions';
import {connect} from 'react-redux';
import classNames from 'classnames';

export class EmptySubRecordPanel extends React.Component {

  static propTypes = {
    isOver: React.PropTypes.bool.isRequired,
    canDrop: React.PropTypes.bool.isRequired,
    type: React.PropTypes.string.isRequired,
    rowId: React.PropTypes.string.isRequired,
    changeSourceSubrecordRow: React.PropTypes.func.isRequired,
    changeTargetSubrecordRow: React.PropTypes.func.isRequired
  }

  render() {
    const { isOver, canDrop } = this.props;

    const classes = classNames({
      'empty-droppable': true,
      'is-over': isOver,
      'can-drop': canDrop,
      'cannot-drop': !canDrop
    });

    return <div className={classes} />;
  }
}

export const EmptySubRecordPanelContainer = connect(
  null,
  subrecordActions
)(EmptySubRecordPanel);
