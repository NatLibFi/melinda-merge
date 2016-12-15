import MarcRecord from 'marc-record-js';
import { Map, List } from 'immutable';
import { SubrecordActionTypes, RecordSaveStatus } from '../constants';
import _ from 'lodash';

import {RESET_WORKSPACE} from '../constants/action-type-constants';
import {SET_SOURCE_RECORD, SET_TARGET_RECORD, SET_MERGED_RECORD } from '../ui-actions';

import { 
  INSERT_SUBRECORD_ROW, REMOVE_SUBRECORD_ROW, CHANGE_SOURCE_SUBRECORD_ROW, CHANGE_TARGET_SUBRECORD_ROW, 
  SET_SUBRECORD_ACTION, SET_MERGED_SUBRECORD, SET_MERGED_SUBRECORD_ERROR, CHANGE_SUBRECORD_ROW, 
  EXPAND_SUBRECORD_ROW, COMPRESS_SUBRECORD_ROW, ADD_SOURCE_SUBRECORD_FIELD, REMOVE_SOURCE_SUBRECORD_FIELD,
  UPDATE_SUBRECORD_ARRANGEMENT, EDIT_MERGED_SUBRECORD, SAVE_SUBRECORD_START, SAVE_SUBRECORD_SUCCESS, SAVE_SUBRECORD_FAILURE,
  TOGGLE_COMPACT_SUBRECORD_VIEW } from '../constants/action-type-constants';

const INITIAL_STATE = Map({
  index: List()
});

export default function subrecords(state = INITIAL_STATE, action) {
  switch (action.type) {

    case INSERT_SUBRECORD_ROW:
      return insertSubrecordRow(state, action.rowIndex);
    case REMOVE_SUBRECORD_ROW:
      return removeSubrecordRow(state, action.rowId);
    case CHANGE_SOURCE_SUBRECORD_ROW:
      return changeSourceSubrecordRow(state, action.fromRowId, action.toRowId);
    case CHANGE_TARGET_SUBRECORD_ROW:
      return changeTargetSubrecordRow(state, action.fromRowId, action.toRowId);

    case CHANGE_SUBRECORD_ROW: 
      return changeSubrecordRow(state, action.fromRowIndex, action.toRowIndex);
    case SET_SUBRECORD_ACTION:
      return setSubrecordAction(state, action.rowId, action.actionType);
    case SET_MERGED_SUBRECORD:
      state = setUnmodifiedMergedRecord(state, action.rowId, action.record);
      return setMergedSubrecord(state, action.rowId, action.record);
    case SET_MERGED_SUBRECORD_ERROR:
      return setMergedSubrecordError(state, action.rowId, action.error);
    case EDIT_MERGED_SUBRECORD:
      return setMergedSubrecord(state, action.rowId, action.record);

    case SET_SOURCE_RECORD:
      return setSourceSubrecords(state, action.record, action.subrecords || []);
    case SET_TARGET_RECORD:
      return setTargetSubrecords(state, action.record, action.subrecords || []);
    case SET_MERGED_RECORD:
      return resetMergedSubrecordsActions(state, action.record);
    
    case EXPAND_SUBRECORD_ROW:
      return expandRow(state, action.rowId);
    case COMPRESS_SUBRECORD_ROW:
      return compressRow(state, action.rowId);
    case UPDATE_SUBRECORD_ARRANGEMENT:
      return setSubrecordsFromPairs(action.pairs);

    case ADD_SOURCE_SUBRECORD_FIELD:
      return addField(state, action.rowId, action.field);
    case REMOVE_SOURCE_SUBRECORD_FIELD:
      return removeField(state, action.rowId, action.field);

    case SAVE_SUBRECORD_START:
      return handleSubrecordSaveStart(state, action.rowId, action.record);
    case SAVE_SUBRECORD_SUCCESS:
      return handleSubrecordSaveSuccess(state, action.rowId, action.record);
    case SAVE_SUBRECORD_FAILURE:
      return handleSubrecordSaveFailure(state, action.rowId, action.error);

    case TOGGLE_COMPACT_SUBRECORD_VIEW:
      return compactItemsWithActionSelected(state);

    case RESET_WORKSPACE:
      return INITIAL_STATE;

  }
  return state;
}


function isControlField(field) {
  return field.subfields === undefined;
}

export function addField(state, rowId, field) {
  const record = state.get(rowId).get('mergedRecord');
  const sourceRecord = state.get(rowId).get('sourceRecord');

  if (isControlField(field)) {
    record.insertControlField(field);
  } else {
    record.insertField(field);
  }
  
  return state
    .setIn([rowId, 'mergedRecord'], setFieldSelected(record, field))
    .setIn([rowId, 'sourceRecord'], setFieldSelected(sourceRecord, field));
}

export function removeField(state, rowId, field) {

  const record = state.get(rowId).get('mergedRecord');
  const sourceRecord = state.get(rowId).get('sourceRecord');

  record.fields = record.fields.filter(currentField => currentField.uuid !== field.uuid);

  return state
    .setIn([rowId, 'mergedRecord'], setFieldUnselected(record, field))
    .setIn([rowId, 'sourceRecord'], setFieldUnselected(sourceRecord, field));
}

function setFieldSelected(record, field) {
  
  record.fields
    .filter(recordField => recordField.uuid === field.uuid)
    .forEach(recordField => {
      recordField.fromOther = true;
      recordField.wasUsed = true;
    });
  return new MarcRecord(record);

}

function setFieldUnselected(record, field) {
  record.fields
    .filter(recordField => recordField.uuid === field.uuid)
    .forEach(recordField => {
      recordField.fromOther = false;
      recordField.wasUsed = false;
    });

  return new MarcRecord(record);
}


function expandRow(state, rowId) {
  return state.update(rowId, createEmptyRow(), row => row.set('isExpanded', true));
}

function compressRow(state, rowId) {
  return state.update(rowId, createEmptyRow(), row => row.set('isExpanded', false));
}

function compactItemsWithActionSelected(state) {
  const rowsToCompact = state.get('index').filter(rowId => {
    const row = state.get(rowId);
    return row.get('mergedRecord') !== undefined;
  });

  return rowsToCompact.reduce((state, rowId) => compressRow(state, rowId), state);
}

export function setSourceSubrecords(state, record, subrecords) {

  state = state.get('index').reduce((state, key) => {
    return state.update(key, row => row.set('sourceRecord', undefined));
  }, state);

  state = pruneEmptyRows(state);

  return subrecords.reduce((state, subrecord) => {

    const row = createEmptyRow().set('sourceRecord', subrecord);
    const newRowKey = row.get('rowId');
    return state
        .set(newRowKey, row)
        .update('index', index => index.push(newRowKey));

  }, state);
}

function pruneEmptyRows(state) {
  return state.get('index')
    .map(rowId => state.get(rowId))
    .filter(row => row.get('targetRecord') === undefined && row.get('sourceRecord') === undefined)
    .reduce((state, row) => {
      const rowId = row.get('rowId');

      return state.delete(rowId).update('index', index => {
        const itemIndex = index.indexOf(rowId);
        return itemIndex === -1 ? index : index.delete(itemIndex);
      });
    }, state);
}

export function setTargetSubrecords(state, record, subrecords) {

  state = state.get('index').reduce((state, key) => {
    return state.update(key, row => row.set('targetRecord', undefined));
  }, state);

  state = pruneEmptyRows(state);

  return subrecords.reduce((state, subrecord) => {

    const row = createEmptyRow().set('targetRecord', subrecord);
    const newRowKey = row.get('rowId');
    return state
        .set(newRowKey, row)
        .update('index', index => index.push(newRowKey));

  }, state);

}

function setSubrecordsFromPairs(pairs) {
  return pairs.reduce((state, pair) => {
    const row = createEmptyRow()
      .set('sourceRecord', pair[0])
      .set('targetRecord', pair[1]);
    const rowId = row.get('rowId');
    return state
      .set(rowId, row)
      .update('index', index => index.push(rowId));

  }, INITIAL_STATE);
}

export function resetMergedSubrecordsActions(state) {
  return state
    .setIn(['mergedRecord'], List())
    .setIn(['actions'], List());
}

export function insertSubrecordRow(state, rowIndex) {

  const row = createEmptyRow();
  const rowId = row.get('rowId');
  return state
    .set(rowId, row)
    .update('index', index => index.insert(rowIndex, rowId));

}

export function removeSubrecordRow(state, rowId) {

  if (state.getIn([rowId, 'sourceRecord']) !== undefined || state.getIn([rowId, 'targetRecord']) !== undefined) {
    return state;
  }

  return state
    .delete(rowId)
    .update('index', index => {
      const rowIndex = index.indexOf(rowId);
      if (rowIndex !== -1) {
        return index.remove(rowIndex);
      } else {
        return index;
      }
    });
}

export function changeSourceSubrecordRow(state, fromRowId, toRowId) {

  if (state.getIn([toRowId, 'sourceRecord']) !== undefined) {
    return state;
  }

  const resetFromRow = _.partial(resetRowStatus, _, fromRowId);
  const resetToRow = _.partial(resetRowStatus, _, toRowId);
  const moveSourceRecord = (state) => {
    return state
      .setIn([toRowId, 'sourceRecord'], state.getIn([fromRowId, 'sourceRecord']))
      .setIn([fromRowId, 'sourceRecord'], undefined);
  };
  return _.flow([moveSourceRecord, resetFromRow, resetToRow])(state);
}

export function changeTargetSubrecordRow(state, fromRowId, toRowId) {

  if (state.getIn([toRowId, 'targetRecord']) !== undefined) {
    return state;
  }

  const resetFromRow = _.partial(resetRowStatus, _, fromRowId);
  const resetToRow = _.partial(resetRowStatus, _, toRowId);
  const moveTargetRecord = (state) => {
    return state
      .setIn([toRowId, 'targetRecord'], state.getIn([fromRowId, 'targetRecord']))
      .setIn([fromRowId, 'targetRecord'], undefined);
  };
  return _.flow([moveTargetRecord, resetFromRow, resetToRow])(state);
}

function resetRowStatus(state, rowId) {
  return state
    .setIn([rowId, 'selectedAction'], undefined)
    .setIn([rowId, 'mergedRecord'], undefined)
    .setIn([rowId, 'mergeError'], undefined)
    .setIn([rowId, 'saveStatus'], undefined)
    .setIn([rowId, 'saveError'], undefined)
    .setIn([rowId, 'unmodifiedMergedRecord'], undefined);
}

export function changeSubrecordRow(state, fromRowIndex, toRowIndex) {
  return state.update('index', index => {
    return moveRow(fromRowIndex, toRowIndex, index);
  });
}

export function setSubrecordAction(state, rowId, actionType) {
  if (actionType === SubrecordActionTypes.UNSET) {
    return state.update(rowId, createEmptyRow(), row => row.set('selectedAction', undefined));
  } else {
    return state.update(rowId, createEmptyRow(), row => row.set('selectedAction', actionType));  
  }
}

export function setMergedSubrecord(state, rowId, record) {
  return state.update(rowId, createEmptyRow(), row => row.set('mergedRecord', record).set('mergeError', undefined));
}

export function handleSubrecordSaveStart(state, rowId) {
  return state.update(rowId, createEmptyRow(), row => row.set('saveStatus', RecordSaveStatus.SAVE_ONGOING)); 
}

export function handleSubrecordSaveSuccess(state, rowId, record) {
  return state.update(rowId, createEmptyRow(), row => {
    return row
      .set('mergedRecord', record)
      .set('saveStatus', RecordSaveStatus.SAVED);
  });
}

export function handleSubrecordSaveFailure(state, rowId, error) {  
  return state.update(rowId, createEmptyRow(), row => {
    return row
      .set('saveError', error)
      .set('saveStatus', RecordSaveStatus.SAVE_FAILED);
  });
}
export function setUnmodifiedMergedRecord(state, rowId, record) {
  return state.update(rowId, createEmptyRow(), row => row.set('unmodifiedMergedRecord', record));
}

export function setMergedSubrecordError(state, rowId, error) {
  return state.update(rowId, createEmptyRow(), row => row.set('mergeError', error));
}

function moveRow(fromRowIndex, toRowIndex, list) {
  
  const rowToMove = list.get(fromRowIndex);

  const listWithoutRow = list.delete(fromRowIndex);

  const requiredListSize = Math.max(listWithoutRow.size, toRowIndex);

  return listWithoutRow
    .setSize(requiredListSize)
    .insert(toRowIndex, rowToMove);
    
}


let rowIdSeq = 1;
function createEmptyRow() {
  return Map({
    rowId: `row${rowIdSeq++}`,
    saveStatus: RecordSaveStatus.UNSAVED
  });
}
