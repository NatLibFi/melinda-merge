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
    'record': Map(record)
  })));
}

