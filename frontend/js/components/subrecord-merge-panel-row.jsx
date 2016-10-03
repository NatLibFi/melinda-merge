import React from 'react';
import classNames from 'classnames';
import { SubrecordActionTypes } from '../constants';
import { ItemTypes } from '../constants';
import _ from 'lodash';
import { DropTargetEmptySubRecordPanel } from './droppable-subrecord-empty-panel';
import { DraggableSubRecordPanel } from './draggable-subrecord-panel';
import { SubRecordPanel } from './subrecord-panel';
import { SubrecordActionButtonContainer } from './subrecord-action-button';


export class SubrecordMergePanelRow extends React.Component {

  static propTypes = {
    sourceRecord: React.PropTypes.object,
    targetRecord: React.PropTypes.object,
    mergedRecord: React.PropTypes.object,
    selectedAction: React.PropTypes.string,
    i: React.PropTypes.number.isRequired,
    onRemoveRow: React.PropTypes.func.isRequired
  }

  renderSubrecordPanel(record, type, rowIndex) {

    if (record) {
      return (
        <DraggableSubRecordPanel record={record} type={type} rowIndex={rowIndex} />
      );
    } else {
      return <DropTargetEmptySubRecordPanel type={type} rowIndex={rowIndex}/>;
    }
  }

  renderMergedSubrecordPanel(mergedSubrecord, rowIndex, opts) {
    if (mergedSubrecord) {
      return (
        <div>
          <SubrecordActionButtonContainer rowIndex={rowIndex} {...opts} />
          <SubRecordPanel record={mergedSubrecord} />
        </div>
      );
    } else {
      return (<SubrecordActionButtonContainer rowIndex={rowIndex} {...opts} />);
    }
  }


  renderRemoveRowButton(rowIndex) {
    return (
      <button onClick={() => this.props.onRemoveRow(rowIndex)} className="btn-floating btn-hover-opaque btn-small waves-effect waves-light black remove-fab remove-fab-emptyrow">
        <i className="material-icons">clear</i>
      </button>
    );
  }

  render() {

    const {sourceRecord, targetRecord, mergedRecord, i, selectedAction} = this.props;

    const isEmptyRow = sourceRecord === undefined && targetRecord === undefined;
    const isMergeActionAvailable = sourceRecord !== undefined && targetRecord !== undefined;
    const isCopyActionAvailable = !isMergeActionAvailable && !isEmptyRow;

    const rowClasses = classNames({
      'to-merge': selectedAction === SubrecordActionTypes.MERGE,
      'to-result': selectedAction === SubrecordActionTypes.COPY && sourceRecord !== undefined,
      'to-remove-source': selectedAction === SubrecordActionTypes.BLOCK && sourceRecord !== undefined,
      'to-remove-target': selectedAction === SubrecordActionTypes.BLOCK && targetRecord !== undefined
    });

    return (
      <tr className={rowClasses}>

        <td>
          {this.renderSubrecordPanel(sourceRecord, ItemTypes.SOURCE_SUBRECORD, i)}
        </td>
        <td>
          {this.renderSubrecordPanel(targetRecord, ItemTypes.TARGET_SUBRECORD, i)}
        </td>
        <td>
         { isEmptyRow ? this.renderRemoveRowButton(i) : this.renderMergedSubrecordPanel(mergedRecord, i, {isMergeActionAvailable, isCopyActionAvailable, selectedAction}) }
        </td>
      </tr>
    );

  }

}
