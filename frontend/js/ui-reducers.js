import {Map} from 'immutable';

export function loadSourceRecord(state, recordId) {
  return state.set('sourceRecord', Map({
    id: recordId,
    state: 'LOADING'
  }));
}

export function setSourceRecord(state, record) {
  const sourceRecord = state.get('sourceRecord');
  return state.set('sourceRecord', sourceRecord.merge(sourceRecord, Map({
    'state': 'LOADED',
    'record': record
  })));
}

export function loadTargetRecord(state, recordId) {
  return state.set('targetRecord', Map({
    id: recordId,
    state: 'LOADING'
  }));
}

export function setTargetRecord(state, record) {
  const targetRecord = state.get('targetRecord');
  return state.set('targetRecord', targetRecord.merge(targetRecord, Map({
    'state': 'LOADED',
    'record': record
  })));
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

