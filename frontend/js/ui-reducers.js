import {List, Map} from 'immutable';
import _ from 'lodash';

const DEFAULT_MERGED_RECORD = Map({
  state: 'EMPTY',
  subrecords: List(),
  subrecordErrors: List()
});

export function setMergeStatus(state, mergeStatus) {
  const mergeAvailable = mergeStatus.status == 'COMMIT_MERGE_ERROR' ? 'COMMIT_MERGE_AVAILABLE' : 'COMMIT_MERGE_DISABLED';

  return state.set('mergeStatus', Map({
    status: mergeStatus.status,
    message: mergeStatus.message
  }))
  .setIn(['mergeStatus', 'status'], mergeAvailable);
}

export function loadSourceRecord(state, recordId) {
  const intermediateState = state.set('sourceRecord', Map({
    id: recordId,
    state: 'LOADING'
  })).set('mergedRecord', DEFAULT_MERGED_RECORD)
  .setIn(['mergeStatus', 'status'], 'COMMIT_MERGE_DISABLED');

  return normalizeCurrentPair(intermediateState);
}

export function loadTargetRecord(state, recordId) {
  const intermediateState = state.set('targetRecord', Map({
    id: recordId,
    state: 'LOADING'
  })).set('mergedRecord', DEFAULT_MERGED_RECORD)
  .setIn(['mergeStatus', 'status'], 'COMMIT_MERGE_DISABLED');

  return normalizeCurrentPair(intermediateState);

}

function normalizeCurrentPair(state) {
  const sourceRecordId = state.getIn(['sourceRecord', 'id']);
  const targetRecordId = state.getIn(['targetRecord', 'id']);

  const allowedValues = [
    state.getIn(['duplicateDatabase', 'currentPair', 'preferredRecordId']),
    state.getIn(['duplicateDatabase', 'currentPair', 'otherRecordId']),
    undefined
  ];

  if (_.includes(allowedValues, sourceRecordId) && _.includes(allowedValues, targetRecordId)) {
    return state;
  } else {
    return state.setIn(['duplicateDatabase', 'currentPair'], Map());
  }
}

export function setSourceRecord(state, record, subrecords) {
  
  return state
    .updateIn(['sourceRecord', 'state'], () => 'LOADED')
    .updateIn(['sourceRecord', 'record'], () => record)
    .setIn(['sourceRecord', 'subrecords'], List(subrecords));
}

export function setTargetRecord(state, record, subrecords) {

  return state
    .updateIn(['targetRecord', 'state'], () => 'LOADED')
    .updateIn(['targetRecord', 'record'], () => record)
    .setIn(['targetRecord', 'subrecords'], List(subrecords));
}

export function setMergedRecord(state, record) {

  return state
    .updateIn(['mergedRecord', 'state'], () => 'LOADED')
    .updateIn(['mergedRecord', 'record'], () => record)
    .updateIn(['mergedRecord', 'subrecords'], () => List())
    .updateIn(['subrecordActions'], () => List())
    .setIn(['mergeStatus', 'status'], 'COMMIT_MERGE_AVAILABLE');
}

export function clearMergedRecord(state) {
  return state.set('mergedRecord', DEFAULT_MERGED_RECORD);
}

export function setMergedRecordError(state, errorMessage) {
  return state
    .updateIn(['mergedRecord', 'state'], () => 'ERROR')
    .updateIn(['mergedRecord', 'errorMessage'], () => errorMessage)
    .setIn(['mergeStatus', 'status'], 'COMMIT_MERGE_DISABLED');
}

export function setTargetRecordError(state, error) {
  return state
    .setIn(['targetRecord', 'state'], 'ERROR')
    .setIn(['targetRecord', 'errorMessage'], error);
}

export function setSourceRecordError(state, error) {
  return state
    .setIn(['sourceRecord', 'state'], 'ERROR')
    .setIn(['sourceRecord', 'errorMessage'], error);
}

export function setTargetRecordId(state, recordId) {
  return state.setIn(['targetRecord', 'id'], recordId);
}

export function setSourceRecordId(state, recordId) {
  return state.setIn(['sourceRecord', 'id'], recordId);
}

export function createSessionStart(state) {
  return state.set('sessionState', 'SIGNIN_ONGOING');
}

export function createSessionError(state, message) {
  return state
    .set('sessionState', 'SIGNIN_ERROR')
    .set('createSessionErrorMessage', message);
}

export function createSessionSuccess(state, userinfo) {
  return state
    .set('sessionState', 'SIGNIN_OK')
    .set('userinfo', userinfo);
}

export function validateSessionStart(state) {
  return state
    .set('sessionState', 'VALIDATION_ONGOING');
}

export function setLocation(state, location) {
  return state
    .set('location', location);
}

export function insertSubrecordRow(state, rowIndex) {

  const insertUndefinedAtRow = _.curry(insertUndefined)(rowIndex);
 
  return state
    .updateIn(['sourceRecord', 'subrecords'], insertUndefinedAtRow)
    .updateIn(['targetRecord', 'subrecords'], insertUndefinedAtRow)
    .updateIn(['mergedRecord', 'subrecords'], insertUndefinedAtRow)
    .updateIn(['subrecordActions'], insertUndefinedAtRow);

}

export function removeSubrecordRow(state, rowIndex) {
  const removeUndefinedAtRow = _.curry(removeUndefined)(rowIndex);

  const {sourceSubrecords, targetSubrecords} = getSubrecordLists(state);
  if (sourceSubrecords.get(rowIndex) !== undefined || targetSubrecords.get(rowIndex) !== undefined) {
    return state;
  }
 
  return state
    .updateIn(['sourceRecord', 'subrecords'], removeUndefinedAtRow)
    .updateIn(['targetRecord', 'subrecords'], removeUndefinedAtRow)
    .updateIn(['mergedRecord', 'subrecords'], removeUndefinedAtRow)
    .updateIn(['subrecordActions'], removeUndefinedAtRow);
}

function getSubrecordLists(state) {

  const sourceSubrecords = state.getIn(['sourceRecord', 'subrecords']);
  const targetSubrecords = state.getIn(['targetRecord', 'subrecords']);
  const mergedSubrecords = state.getIn(['mergedRecord', 'subrecords']);
 
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

export function changeSourceSubrecordRow(state, fromRowIndex, toRowIndex) {
  const swapper = _.partial(swapItems, fromRowIndex, toRowIndex);
  const resetRows = _.partial(resetListIndices, [fromRowIndex, toRowIndex]);

  return state
    .updateIn(['sourceRecord', 'subrecords'], swapper)
    .updateIn(['mergedRecord', 'subrecords'], resetRows)
    .updateIn(['subrecordActions'], resetRows);
}

export function changeTargetSubrecordRow(state, fromRowIndex, toRowIndex) {
  const swapper = _.partial(swapItems, fromRowIndex, toRowIndex);
  const resetRows = _.partial(resetListIndices, [fromRowIndex, toRowIndex]);

  return state
    .updateIn(['targetRecord', 'subrecords'], swapper)
    .updateIn(['mergedRecord', 'subrecords'], resetRows)
    .updateIn(['subrecordActions'], resetRows);
}

export function changeSubrecordRow(state, fromRowIndex, toRowIndex) {
  const changeRow = _.partial(moveRow, fromRowIndex, toRowIndex);

  return state
    .updateIn(['sourceRecord', 'subrecords'], changeRow)
    .updateIn(['targetRecord', 'subrecords'], changeRow)
    .updateIn(['mergedRecord', 'subrecords'], changeRow)
    .updateIn(['subrecordActions'], changeRow);
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

function moveRow(fromRowIndex, toRowIndex, list) {
  
  const rowToMove = list.get(fromRowIndex);

  const listWithoutRow = list.delete(fromRowIndex);

  const requiredListSize = Math.max(listWithoutRow.size, toRowIndex);

  return listWithoutRow
    .setSize(requiredListSize)
    .insert(toRowIndex, rowToMove);
    
}

export function setSubrecordAction(state, rowIndex, actionType) {
  return state.updateIn(['subrecordActions'], actionList => {
    return actionList.set(rowIndex, actionType);
  });
}

export function setMergedSubrecord(state, rowIndex, record) {
  return state.updateIn(['mergedRecord', 'subrecords'], subrecordList => {
    return subrecordList.set(rowIndex, record);
  });
}

export function setMergedSubrecordError(state, rowIndex, error) {
  return state.updateIn(['mergedRecord', 'subrecordErrors'], errorsList => {
    return errorsList.set(rowIndex, error);
  });
}
