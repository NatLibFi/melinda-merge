import React from 'react';
import classNames from 'classnames';
import { SubrecordActionTypes, ItemTypes } from '../../constants';
import { DropTargetEmptySubRecordPanel } from './droppable-subrecord-empty-panel';
import { DraggableSubRecordPanel } from './draggable-subrecord-panel';
import { SubRecordPanel } from './subrecord-panel';
import { SubrecordActionButtonContainer } from './subrecord-action-button';
import { DropTarget, DragSource } from 'react-dnd';
import { MergeValidationErrorMessagePanel } from '../merge-validation-error-message-panel';

import '../../../styles/components/subrecord-merge-panel-row.scss';

export class SubrecordMergePanelRow extends React.Component {

  static propTypes = {
    rowId: React.PropTypes.string.isRequired,
    sourceRecord: React.PropTypes.object,
    targetRecord: React.PropTypes.object,
    mergedRecord: React.PropTypes.object,
    selectedAction: React.PropTypes.string,
    rowIndex: React.PropTypes.number.isRequired,
    isExpanded: React.PropTypes.bool,
    actionsEnabled: React.PropTypes.bool,
    onRemoveRow: React.PropTypes.func.isRequired,
    onExpandRow: React.PropTypes.func.isRequired,
    onCompressRow: React.PropTypes.func.isRequired,

    connectDragSource: React.PropTypes.func.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired,
    onSourceFieldClick: React.PropTypes.func,
    onMergedFieldClick: React.PropTypes.func,
    onSaveRecord: React.PropTypes.func.isRequired,
    onMergedRecordUpdate: React.PropTypes.func.isRequired,
    isOver: React.PropTypes.bool.isRequired,
    mergeError: React.PropTypes.instanceOf(Error),
    saveRecordError: React.PropTypes.instanceOf(Error),
    recordState: React.PropTypes.string,
    saveButtonVisible: React.PropTypes.bool.isRequired,
    isCompacted: React.PropTypes.bool.isRequired
  }

  handleSourceFieldClick(field) {
    if (this.props.onSourceFieldClick) {
      this.props.onSourceFieldClick(this.props.rowId, field);
    }
  }
  
  handleMergedFieldClick(field) {
    if (this.props.onMergedFieldClick) {
      this.props.onMergedFieldClick(this.props.rowId, field);
    }
  }
  
  handleRecordUpdate(record) {
    this.props.onMergedRecordUpdate(this.props.rowId, record);
  }
  
  handleRecordSave(recordId, record) {
    this.props.onSaveRecord(this.props.rowId, recordId, record);
  }


  renderSubrecordPanel(record, type, rowId, isExpanded, dragEnabled) {

    const { isCompacted } = this.props;

    if (record) {

      const title = type === ItemTypes.SOURCE_SUBRECORD ? 'Poistuva tietue' : 'Säilyvä tietue';

      const fieldClickHandler = type === ItemTypes.SOURCE_SUBRECORD ? this.handleSourceFieldClick.bind(this) : undefined;
      return (
        <DraggableSubRecordPanel isCompacted={isCompacted} isExpanded={isExpanded} dragEnabled={dragEnabled} record={record} type={type} rowId={rowId} onFieldClick={fieldClickHandler} showHeader title={title}/>
      );
    } else {
      return <DropTargetEmptySubRecordPanel type={type} rowId={rowId} />;
    }
  }

  renderMergedSubrecordPanel(mergedSubrecord, rowId, isExpanded, mergeError, opts) {
    
    const { isCompacted } = this.props;

    if (mergeError) {
      return (
        <div className="fill-height">
          <SubrecordActionButtonContainer rowId={rowId} {...opts} />
          <MergeValidationErrorMessagePanel error={mergeError} />
        </div>
      );
    }
    if (mergedSubrecord) {

      return (
        <div className="fill-height">
          { isCompacted ? null  : <SubrecordActionButtonContainer rowId={rowId} {...opts} /> }
          <SubRecordPanel 
            isExpanded={isExpanded} 
            isCompacted={isCompacted} 
            record={mergedSubrecord} 
            type="MERGED" 
            onFieldClick={this.handleMergedFieldClick.bind(this)}
            onRecordUpdate={this.handleRecordUpdate.bind(this)}
            onSaveRecord={this.handleRecordSave.bind(this)}
            error={mergeError}
            saveRecordError={this.props.saveRecordError}
            recordState={this.props.recordState}
            saveButtonVisible={this.props.saveButtonVisible}
            showHeader
            editable
            title="Yhdistetty"
             />
        </div>
      );
    } else {
      return (<SubrecordActionButtonContainer rowId={rowId} {...opts} />);
    }
  }

  renderRemoveRowButton(rowId) {
    return (
      <button onClick={() => this.props.onRemoveRow(rowId)} className="btn-floating btn-hover-opaque btn-small waves-effect waves-light black remove-fab remove-fab-emptyrow">
        <i className="material-icons">clear</i>
      </button>
    );
  }

  renderExpandToggleButton(rowId, isEmptyRow, isExpanded) {

    if (isEmptyRow) {
      return null;
    } else {
      return isExpanded ? this.renderCompressRowButton(rowId) : this.renderExpandRowButton(rowId);
    }
  }

  renderExpandRowButton(rowId) {
    return (
      <button onClick={() => this.props.onExpandRow(rowId)} className="btn-floating btn-hover-opaque btn-small waves-effect waves-light black remove-fab remove-fab-emptyrow">
        <i className="material-icons">expand_more</i>
      </button>
    ); 
  }

  renderCompressRowButton(rowId) {
    return (
      <button onClick={() => this.props.onCompressRow(rowId)} className="btn-floating btn-hover-opaque btn-small waves-effect waves-light black remove-fab remove-fab-emptyrow">
        <i className="material-icons">expand_less</i>
      </button>
    ); 
  }

  render() {
    const {rowId, sourceRecord, targetRecord, mergedRecord, selectedAction, connectDragSource, connectDropTarget, isOver, isExpanded, mergeError, actionsEnabled, isCompacted} = this.props;
    
    const isEmptyRow = sourceRecord === undefined && targetRecord === undefined;
    const isMergeActionAvailable = sourceRecord !== undefined && targetRecord !== undefined;
    const isCopyActionAvailable = !isMergeActionAvailable && !isEmptyRow;

    const rowClasses = classNames({
      'to-merge': selectedAction === SubrecordActionTypes.MERGE,
      'to-result': selectedAction === SubrecordActionTypes.COPY && sourceRecord !== undefined,
      'to-remove-source': selectedAction === SubrecordActionTypes.BLOCK && sourceRecord !== undefined,
      'to-remove-target': selectedAction === SubrecordActionTypes.BLOCK && targetRecord !== undefined,
      'is-over': isOver,
      'is-compacted': isCompacted
    });

    return connectDragSource(connectDropTarget(
      <tr className={rowClasses}>

        <td>
          {this.renderSubrecordPanel(sourceRecord, ItemTypes.SOURCE_SUBRECORD, rowId, isExpanded, actionsEnabled)}
        </td>
        <td>
          {this.renderSubrecordPanel(targetRecord, ItemTypes.TARGET_SUBRECORD, rowId, isExpanded, actionsEnabled)}
        </td>
        <td>
         { isEmptyRow ? this.renderRemoveRowButton(rowId) : this.renderMergedSubrecordPanel(mergedRecord, rowId, isExpanded, mergeError, {isMergeActionAvailable, isCopyActionAvailable, selectedAction, actionsEnabled}) }
         { isCompacted ? null : this.renderExpandToggleButton(rowId, isEmptyRow, isExpanded) }
        </td>
      </tr>
    ));

  }
}

const rowSource = {

  beginDrag(props) {
    const { rowIndex } = props;
    return { rowIndex };
  },
  canDrag(props) {
    if (props && props.isExpanded) {
      return false;
    }

    if (props && props.isCompacted) {
      return false;
    }
    
    if (props && props.actionsEnabled !== true) {
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

var rowTarget = {
  drop(props, monitor) {
    
    const item = monitor.getItem();
    const fromRow = item.rowIndex;
    const toRow = props.rowIndex;
    
    props.onMoveRow(fromRow, toRow);
  }
};

var collectTarget = function(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
};

const dragSourceComponent = DragSource(ItemTypes.SUBRECORD_ROW, rowSource, collect)(SubrecordMergePanelRow);

export const DragDropSubrecordMergePanelRow = DropTarget(ItemTypes.SUBRECORD_ROW, rowTarget, collectTarget)(dragSourceComponent);
