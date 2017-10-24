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
import { ItemTypes } from '../../constants';
import { DropTarget } from 'react-dnd';
import { EmptySubRecordPanelContainer } from './subrecord-empty-panel';
import * as subrecordActions from '../../action-creators/subrecord-actions';
import {connect} from 'react-redux';
import compose from 'lodash/flowRight';

export class DroppableEmptySubRecordPanel extends React.Component {

  static propTypes = {
    connectDropTarget: React.PropTypes.func.isRequired,
    isOver: React.PropTypes.bool.isRequired,
    canDrop: React.PropTypes.bool.isRequired,
    type: React.PropTypes.string.isRequired,
    rowId: React.PropTypes.string.isRequired,
    changeSourceSubrecordRow: React.PropTypes.func.isRequired,
    changeTargetSubrecordRow: React.PropTypes.func.isRequired
  }

  render() {
    const { connectDropTarget } = this.props;

    return connectDropTarget(<div><EmptySubRecordPanelContainer {...this.props} /></div>);
  }
}

const emptySlotTarget = {
  drop(props, monitor, component) {

    const { type, rowId } = props;
    const item = monitor.getItem();
    
    const fromRowId = item.rowId;
    const toRowId = rowId;

    if (type == ItemTypes.SOURCE_SUBRECORD) {
      component.props.changeSourceSubrecordRow(fromRowId, toRowId);
    }
    if (type == ItemTypes.TARGET_SUBRECORD) {
      component.props.changeTargetSubrecordRow(fromRowId, toRowId);
    }

  },

  canDrop(props, monitor) {
    const item = monitor.getItem();
    return (props.type == item.type);
  }

};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
 
  };
}

export const DropTargetEmptySubRecordPanel = compose(
  connect(
    null,
    subrecordActions
  ),
  DropTarget(ItemTypes.SUBRECORD, emptySlotTarget, collect)
)(DroppableEmptySubRecordPanel);
