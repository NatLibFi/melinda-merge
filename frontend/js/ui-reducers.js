import {Map} from 'immutable';
import createRecordMerger from 'marc-record-merge';
import mergeConfiguration from './config/merge-config';

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
  
  const nextState = state
    .updateIn(['sourceRecord', 'state'], () => 'LOADED')
    .updateIn(['sourceRecord', 'record'], () => record);

  const mergedRecord = calculateMergedRecord(nextState.get('sourceRecord'), nextState.get('targetRecord'));

  return nextState.set('mergedRecord', mergedRecord);
}

export function setTargetRecord(state, record) {

  const nextState = state
    .updateIn(['targetRecord', 'state'], () => 'LOADED')
    .updateIn(['targetRecord', 'record'], () => record);

  const mergedRecord = calculateMergedRecord(nextState.get('sourceRecord'), nextState.get('targetRecord'));

  return nextState.set('mergedRecord', mergedRecord);
}

function calculateMergedRecord(sourceRecord, targetRecord) {
  if (sourceRecord.get('state') === 'LOADED' && targetRecord.get('state') === 'LOADED') {
    const merge = createRecordMerger(mergeConfiguration);
    const mergedRecord = merge(sourceRecord.get('record'), targetRecord.get('record'));

    return Map({
      record: mergedRecord,
      state: 'LOADED'
    });
  } else {
    return DEFAULT_MERGED_RECORD;
  }
  
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
