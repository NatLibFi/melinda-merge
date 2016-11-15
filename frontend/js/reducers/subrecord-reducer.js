import { List, fromJS } from 'immutable';
import _ from 'lodash';

import {INSERT_SUBRECORD_ROW, REMOVE_SUBRECORD_ROW, CHANGE_SOURCE_SUBRECORD_ROW, CHANGE_TARGET_SUBRECORD_ROW, 
  SET_SUBRECORD_ACTION, SET_MERGED_SUBRECORD, SET_MERGED_SUBRECORD_ERROR, CHANGE_SUBRECORD_ROW} from '../ui-actions';
import {RESET_WORKSPACE} from '../constants/action-type-constants';

import {SET_SOURCE_RECORD, SET_TARGET_RECORD, SET_MERGED_RECORD } from '../ui-actions';

const INITIAL_STATE = fromJS({
  sourceRecord: [],
  targetRecord: [],
  mergedRecord: [],
  actions: []
});

export default function subrecords(state = INITIAL_STATE, action) {
  switch (action.type) {

    case INSERT_SUBRECORD_ROW:
      return insertSubrecordRow(state, action.rowIndex);
    case REMOVE_SUBRECORD_ROW:
      return removeSubrecordRow(state, action.rowIndex);
    case CHANGE_SOURCE_SUBRECORD_ROW:
      return changeSourceSubrecordRow(state, action.fromRowIndex, action.toRowIndex);
    case CHANGE_TARGET_SUBRECORD_ROW:
      return changeTargetSubrecordRow(state, action.fromRowIndex, action.toRowIndex);

    case CHANGE_SUBRECORD_ROW: 
      return changeSubrecordRow(state, action.fromRowIndex, action.toRowIndex);
    case SET_SUBRECORD_ACTION:
      return setSubrecordAction(state, action.rowIndex, action.actionType);
    case SET_MERGED_SUBRECORD:
      return setMergedSubrecord(state, action.rowIndex, action.record);
    case SET_MERGED_SUBRECORD_ERROR:
      return setMergedSubrecordError(state, action.rowIndex, action.error);

    case SET_SOURCE_RECORD:
      return setSourceSubrecords(state, action.record, action.subrecords);
    case SET_TARGET_RECORD:
      return setTargetSubrecords(state, action.record, action.subrecords);
    case SET_MERGED_RECORD:
      return resetMergedSubrecordsActions(state, action.record);
    case RESET_WORKSPACE:
      return INITIAL_STATE;

  }
  return state;
}

export function setSourceSubrecords(state, record, subrecords) {
  return state.setIn(['sourceRecord'], List(subrecords));
}
export function setTargetSubrecords(state, record, subrecords) {
  return state.setIn(['targetRecord'], List(subrecords));
}
export function resetMergedSubrecordsActions(state) {
  return state
    .setIn(['mergedRecord'], List())
    .setIn(['actions'], List());
}

export function insertSubrecordRow(state, rowIndex) {

  const insertUndefinedAtRow = _.curry(insertUndefined)(rowIndex);
 
  return state
    .updateIn(['sourceRecord'], insertUndefinedAtRow)
    .updateIn(['targetRecord'], insertUndefinedAtRow)
    .updateIn(['mergedRecord'], insertUndefinedAtRow)
    .updateIn(['actions'], insertUndefinedAtRow);

}

export function removeSubrecordRow(state, rowIndex) {
  const removeUndefinedAtRow = _.curry(removeUndefined)(rowIndex);

  const {sourceSubrecords, targetSubrecords} = getSubrecordLists(state);
  if (sourceSubrecords.get(rowIndex) !== undefined || targetSubrecords.get(rowIndex) !== undefined) {
    return state;
  }
 
  return state
    .updateIn(['sourceRecord'], removeUndefinedAtRow)
    .updateIn(['targetRecord'], removeUndefinedAtRow)
    .updateIn(['mergedRecord'], removeUndefinedAtRow)
    .updateIn(['actions'], removeUndefinedAtRow);

}

export function changeSourceSubrecordRow(state, fromRowIndex, toRowIndex) {
  const swapper = _.partial(swapItems, fromRowIndex, toRowIndex);
  const resetRows = _.partial(resetListIndices, [fromRowIndex, toRowIndex]);

  return state
    .updateIn(['sourceRecord'], swapper)
    .updateIn(['mergedRecord'], resetRows)
    .updateIn(['actions'], resetRows);
}

export function changeTargetSubrecordRow(state, fromRowIndex, toRowIndex) {
  const swapper = _.partial(swapItems, fromRowIndex, toRowIndex);
  const resetRows = _.partial(resetListIndices, [fromRowIndex, toRowIndex]);

  return state
    .updateIn(['targetRecord'], swapper)
    .updateIn(['mergedRecord'], resetRows)
    .updateIn(['actions'], resetRows);
}

export function changeSubrecordRow(state, fromRowIndex, toRowIndex) {
  const changeRow = _.partial(moveRow, fromRowIndex, toRowIndex);

  return state
    .updateIn(['sourceRecord'], changeRow)
    .updateIn(['targetRecord'], changeRow)
    .updateIn(['mergedRecord'], changeRow)
    .updateIn(['actions'], changeRow);
}

function resetListIndices(rowIndexArr, list) {
  return rowIndexArr.reduce((acc, index) => acc.set(index, undefined), list);
}

function swapItems(fromRowIndex, toRowIndex, list) {
  const from = list.get(fromRowIndex);
  const to = list.get(toRowIndex);

  if (from === undefined || to !== undefined) {
    return list;
  }

  return list
    .set(fromRowIndex, to)
    .set(toRowIndex, from);
}

export function setSubrecordAction(state, rowIndex, actionType) {
  return state.updateIn(['actions'], actionList => {
    return actionList.set(rowIndex, actionType);
  });
}

export function setMergedSubrecord(state, rowIndex, record) {
  return state.updateIn(['mergedRecord'], subrecordList => {
    return subrecordList.set(rowIndex, record);
  });
}

export function setMergedSubrecordError(state, rowIndex, error) {
  return state.updateIn(['mergedRecordErrors'], errorsList => {
    return errorsList.set(rowIndex, error);
  });
}

function moveRow(fromRowIndex, toRowIndex, list) {
  
  const rowToMove = list.get(fromRowIndex);

  const listWithoutRow = list.delete(fromRowIndex);

  const requiredListSize = Math.max(listWithoutRow.size, toRowIndex);

  return listWithoutRow
    .setSize(requiredListSize)
    .insert(toRowIndex, rowToMove);
    
}

function getSubrecordLists(state) {

  const sourceSubrecords = state.getIn(['sourceRecord']);
  const targetSubrecords = state.getIn(['targetRecord']);
  const mergedSubrecords = state.getIn(['mergedRecord']);
 
  return {sourceSubrecords, targetSubrecords, mergedSubrecords};
   
}

function insertUndefined(index, arr) {
  if (index > arr.size) {
    return arr;
  }
  return arr.insert(index, undefined);
}

function removeUndefined(index, arr) {
  if (index > arr.size || arr.get(index) !== undefined) {
    return arr;
  }
  return arr.remove(index, 1);
}

