import { List, Map } from 'immutable';
import { DEFAULT_MERGED_RECORD } from './root-reducer';

export function setMergeStatus(state, mergeStatus) {
  const mergeAvailable = mergeStatus.status == 'COMMIT_MERGE_ERROR' ? 'COMMIT_MERGE_AVAILABLE' : 'COMMIT_MERGE_DISABLED';

  return state.set('mergeStatus', Map({
    status: mergeStatus.status,
    message: mergeStatus.message
  }))
  .setIn(['mergeStatus', 'status'], mergeAvailable);
}

export function loadSourceRecord(state, recordId) {
  return state.set('sourceRecord', Map({
    id: recordId,
    state: 'LOADING'
  }));
  
}

export function loadTargetRecord(state, recordId) {
  return state.set('targetRecord', Map({
    id: recordId,
    state: 'LOADING'
  }));

}

export function setSourceRecord(state, record, subrecords) {
  
  return state
    .updateIn(['sourceRecord', 'state'], () => 'LOADED')
    .updateIn(['sourceRecord', 'record'], () => record)
    .setIn(['subrecords', 'sourceRecord'], List(subrecords));
}

export function setTargetRecord(state, record, subrecords) {

  return state
    .updateIn(['targetRecord', 'state'], () => 'LOADED')
    .updateIn(['targetRecord', 'record'], () => record)
    .setIn(['subrecords', 'targetRecord'], List(subrecords));
}

export function setMergedRecord(state, record) {

  return state
    .updateIn(['mergedRecord', 'state'], () => 'LOADED')
    .updateIn(['mergedRecord', 'record'], () => record)
    .updateIn(['subrecords', 'mergedRecord'], () => List())
    .updateIn(['subrecords', 'actions'], () => List());
}

export function clearMergedRecord(state) {
  return state.set('mergedRecord', DEFAULT_MERGED_RECORD);
}

export function setMergedRecordError(state, errorMessage) {
  return state
    .updateIn(['mergedRecord', 'state'], () => 'ERROR')
    .updateIn(['mergedRecord', 'errorMessage'], () => errorMessage);
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
