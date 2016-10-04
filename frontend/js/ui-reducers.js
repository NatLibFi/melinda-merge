import { Map } from 'immutable';
import { DEFAULT_MERGED_RECORD } from './root-reducer';


export function setMergeStatus(state, mergeStatus) {
  const mergeAvailable = mergeStatus.status == 'COMMIT_MERGE_ERROR' ? 'COMMIT_MERGE_AVAILABLE' : 'COMMIT_MERGE_DISABLED';

  return Map({
    status: mergeAvailable,
    message: mergeStatus.message
  });
}

export function loadSourceRecord(state, recordId) {
  return Map({
    id: recordId,
    state: 'LOADING'
  });
  
}

export function loadTargetRecord(state, recordId) {
  return Map({
    id: recordId,
    state: 'LOADING'
  });
}

export function setSourceRecord(state, record) {
  
  return state
    .updateIn(['state'], () => 'LOADED')
    .updateIn(['record'], () => record);
    //.setIn(['subrecords', 'sourceRecord'], List(subrecords)); // TODO move to subrecord reducer
}

export function setTargetRecord(state, record) {

  return state
    .set('state', 'LOADED')
    .set('record', record);
    //.setIn(['subrecords', 'targetRecord'], List(subrecords)); // TODO move to subrecord reducer
}

export function setMergedRecord(state, record) {

  return state
    .updateIn(['state'], () => 'LOADED')
    .updateIn(['record'], () => record);
   // .updateIn(['subrecords', 'mergedRecord'], () => List()) // TODO move to subrecord reducer
   // .updateIn(['subrecords', 'actions'], () => List()); // TODO move to subrecord reducer
}

export function clearMergedRecord() {
  return DEFAULT_MERGED_RECORD;
}

export function setMergedRecordError(state, errorMessage) {
  return state
    .updateIn(['state'], () => 'ERROR')
    .updateIn(['errorMessage'], () => errorMessage);
}

export function setTargetRecordError(state, error) {
  return state
    .setIn(['state'], 'ERROR')
    .setIn(['errorMessage'], error);
}

export function setSourceRecordError(state, error) {
  return state
    .setIn(['state'], 'ERROR')
    .setIn(['errorMessage'], error);
}

export function setTargetRecordId(state, recordId) {
  return state.setIn(['id'], recordId);
}

export function setSourceRecordId(state, recordId) {
  return state.setIn(['id'], recordId);
}
