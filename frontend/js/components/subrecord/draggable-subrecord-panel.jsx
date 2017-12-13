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
import { DragSource } from 'react-dnd';
import { ItemTypes } from '../../constants';
import { SubRecordPanel } from './subrecord-panel';

class SubRecordPanelDragSource extends React.Component {

  static propTypes = {
    type: PropTypes.string.isRequired,
    record: PropTypes.object.isRequired,
    rowId: PropTypes.string.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    dragEnabled: PropTypes.bool.isRequired
  }

  render() {

    const { connectDragSource } = this.props;

    return connectDragSource(<div className="fill-height"><SubRecordPanel {...this.props} /></div>);
      
  }
}

const subrecordSource = {
  beginDrag(props) {
    const { type, rowId } = props;
    return { type, rowId };
  },
  canDrag(props) {
    if (props && props.isExpanded) {
      return false;
    }
    if (props && props.isCompacted) {
      return false;
    }
    if (props && props.dragEnabled !== true) {
      return false;
    }

    return true;
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

export const DraggableSubRecordPanel = DragSource(ItemTypes.SUBRECORD, subrecordSource, collect)(SubRecordPanelDragSource);
