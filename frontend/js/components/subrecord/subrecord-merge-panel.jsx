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
import { 
  insertSubrecordRow, removeSubrecordRow, changeSubrecordRow, expandSubrecordRow, 
  compressSubrecordRow, toggleSourceSubrecordFieldSelection, editMergedSubrecord,
  saveSubrecord } from '../../action-creators/subrecord-actions';
import {connect} from 'react-redux';
import _ from 'lodash';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { ItemTypes } from '../../constants';
import compose from 'lodash/flowRight';
import { SubrecordActionButtonContainer } from './subrecord-action-button';
import { DragDropSubrecordMergePanelRow } from './subrecord-merge-panel-row';
import { SubrecordMergePanelNewRow } from './subrecord-merge-panel-new-row';
import { subrecordOrder, subrecords } from '../../selectors/subrecord-selectors';
import { recordSaveActionAvailable } from '../../selectors/merge-status-selector';
import { subrecordActionsEnabled } from '../../selectors/merge-status-selector';
import { compactRowsMap } from '../../selectors/ui-selectors';

import '../../../styles/components/subrecord-merge-panel.scss';

export class SubrecordMergePanel extends React.Component {

  static propTypes = {
    subrecordOrder: PropTypes.array.isRequired,
    subrecords: PropTypes.object.isRequired,
    compactRowIdMap: PropTypes.object.isRequired,
    insertSubrecordRow: PropTypes.func.isRequired,
    removeSubrecordRow: PropTypes.func.isRequired,
    changeSubrecordRow: PropTypes.func.isRequired,
    expandSubrecordRow: PropTypes.func.isRequired,
    compressSubrecordRow: PropTypes.func.isRequired,
    editMergedSubrecord: PropTypes.func.isRequired,
    toggleSourceSubrecordFieldSelection: PropTypes.func.isRequired,
    saveSubrecord: PropTypes.func.isRequired,
    saveButtonVisible: PropTypes.bool.isRequired,
    subrecordActionsEnabled: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props);

    this.onMoveRow = this.onMoveRow.bind(this);
    this.onExpandRow = this.onExpandRow.bind(this);
    this.onCompressRow = this.onCompressRow.bind(this);
    this.onRemoveRow = this.onRemoveRow.bind(this);
  }

  renderSubrecordList() {
   
    const { subrecordOrder, subrecords, compactRowIdMap } = this.props;

    const items = subrecordOrder.map((rowId, i) => {
      
      const {sourceRecord, targetRecord, mergedRecord, selectedAction, isExpanded, mergeError, saveStatus, saveRecordError} = subrecords[rowId];
      const isCompacted = compactRowIdMap[rowId] === true;

      return (<DragDropSubrecordMergePanelRow
        key={rowId}
        rowIndex={i}
        rowId={rowId}
        isExpanded={isExpanded}
        actionsEnabled={this.props.subrecordActionsEnabled}
        selectedAction={selectedAction}
        sourceRecord={sourceRecord}
        targetRecord={targetRecord}
        mergedRecord={mergedRecord}
        onMoveRow={this.onMoveRow}
        onExpandRow={this.onExpandRow}
        onCompressRow={this.onCompressRow}
        onRemoveRow={this.onRemoveRow}
        onSourceFieldClick={this.handleFieldClick.bind(this)}
        onMergedFieldClick={this.handleMergedFieldClick.bind(this)}
        onMergedRecordUpdate={this.props.editMergedSubrecord}
        saveButtonVisible={this.props.saveButtonVisible}
        onSaveRecord={this.props.saveSubrecord}
        recordState={saveStatus}
        saveRecordError={saveRecordError}
        mergeError={mergeError}
        isCompacted={isCompacted}
      />);
    });

    return items.reduce((acc, item, i) => {

      return _.concat(acc, item, this.renderAddNewRowElement(i+1));

    }, [this.renderAddNewRowElement(0)]);

  }

  renderMergeActionButton(rowIndex, mergedRecord) {
    return (
      <div>
        <SubrecordActionButtonContainer rowIndex={rowIndex} />
        {this.renderSubrecordPanel(mergedRecord, ItemTypes.MERGED_SUBRECORD, rowIndex)}
      </div>);
  }

  renderAddNewRowElement(key) {
    return <SubrecordMergePanelNewRow key={key} onClick={this.onAddRow(key)} enabled={this.props.subrecordActionsEnabled} />;
  }

  onAddRow(rowIndex) {
    return function() {
      if (this.props.subrecordActionsEnabled) {
        this.props.insertSubrecordRow(rowIndex);
      }
    }.bind(this);
  }

  isControlField(field) {
    return field.subfields === undefined;
  }

  handleFieldClick(rowId, field) {
    if (!this.isControlField(field)) {
      this.props.toggleSourceSubrecordFieldSelection(rowId, field);
    }
  }

  handleMergedFieldClick(rowId, field) {
    if (field.fromOther && !this.isControlField(field)) {
      this.props.toggleSourceSubrecordFieldSelection(rowId, field);
    }
  }

  onRemoveRow(rowId) {
    this.props.removeSubrecordRow(rowId);
  }

  onExpandRow(rowId) {
    this.props.expandSubrecordRow(rowId);
  }

  onCompressRow(rowId) {
    this.props.compressSubrecordRow(rowId);
  }

  onMoveRow(fromIndex, toIndex) {
    this.props.changeSubrecordRow(fromIndex, toIndex);
  }

  render() {
    return (
      
      <table className="bordered subrecord-merge-panel">
        <tbody>
          {this.renderSubrecordList()}
        </tbody>
      </table>

    );
  }
}

function mapStateToProps(state) {
  return {
    subrecordOrder: subrecordOrder(state),
    subrecords: subrecords(state),
    saveButtonVisible: recordSaveActionAvailable(state),
    subrecordActionsEnabled: subrecordActionsEnabled(state),
    compactRowIdMap: compactRowsMap(state)
  };
}

export const DraggableSubrecordMergePanelContainer = compose(

  DragDropContext(HTML5Backend),

  connect(
    mapStateToProps,
    { insertSubrecordRow, removeSubrecordRow, changeSubrecordRow, expandSubrecordRow, compressSubrecordRow, toggleSourceSubrecordFieldSelection, editMergedSubrecord, saveSubrecord }
  )
)(SubrecordMergePanel);
