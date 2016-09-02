import {Map} from 'immutable';

const DEFAULT_MERGED_RECORD = Map({
  state: 'EMPTY'
});

export function loadSourceRecord(state, recordId) {
  return state.set('sourceRecord', Map({
    id: recordId,
    state: 'LOADING'
  })).set('mergedRecord', DEFAULT_MERGED_RECORD);
}

export function loadTargetRecord(state, recordId) {
  return state.set('targetRecord', Map({
    id: recordId,
    state: 'LOADING'
  })).set('mergedRecord', DEFAULT_MERGED_RECORD);
}

export function setSourceRecord(state, record) {
  
  return state
    .updateIn(['sourceRecord', 'state'], () => 'LOADED')
    .updateIn(['sourceRecord', 'record'], () => record);
}

export function setTargetRecord(state, record) {

  return state
    .updateIn(['targetRecord', 'state'], () => 'LOADED')
    .updateIn(['targetRecord', 'record'], () => record);
}

export function setMergedRecord(state, record) {

  return state
    .updateIn(['mergedRecord', 'state'], () => 'LOADED')
    .updateIn(['mergedRecord', 'record'], () => record);
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
  const targetRecord = state.get('targetRecord');
  return state.set('targetRecord', targetRecord.merge(targetRecord, Map({
    'state': 'ERROR',
    'errorMessage': error
  })));
}

export function setSourceRecordError(state, error) {
  const sourceRecord = state.get('sourceRecord');
  return state.set('sourceRecord', sourceRecord.merge(sourceRecord, Map({
    'state': 'ERROR',
    'errorMessage': error
  })));
}

export function setTargetRecordId(state, recordId) {
  return state.setIn(['targetRecord', 'id'], recordId);
}

export function setSourceRecordId(state, recordId) {
  return state.setIn(['sourceRecord', 'id'], recordId);
}
