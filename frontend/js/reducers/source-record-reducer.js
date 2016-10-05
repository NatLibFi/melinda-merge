import { Map } from 'immutable'; 
import {LOAD_SOURCE_RECORD, SET_SOURCE_RECORD, SET_SOURCE_RECORD_ERROR, SET_SOURCE_RECORD_ID } from '../ui-actions';
import {RESET_WORKSPACE} from '../constants/action-type-constants';

const INITIAL_STATE = Map({
  state: 'EMPTY'
});

export default function sourceRecord(state = INITIAL_STATE, action) {
  switch (action.type) {
  case LOAD_SOURCE_RECORD:
    return loadSourceRecord(state, action.id);
  case SET_SOURCE_RECORD:
    return setSourceRecord(state, action.record, action.subrecords);
  case SET_SOURCE_RECORD_ERROR:
    return setSourceRecordError(state, action.error);
  case SET_SOURCE_RECORD_ID:
    return setSourceRecordId(state, action.recordId);
  case RESET_WORKSPACE:
    return INITIAL_STATE;

  }
  return state;
}


export function loadSourceRecord(state, recordId) {
  return Map({
    id: recordId,
    state: 'LOADING'
  });
  
}


export function setSourceRecord(state, record) {
  
  return state
    .updateIn(['state'], () => 'LOADED')
    .updateIn(['record'], () => record);
}

export function setSourceRecordError(state, error) {
  return state
    .setIn(['state'], 'ERROR')
    .setIn(['errorMessage'], error);
}

export function setSourceRecordId(state, recordId) {
  return state.setIn(['id'], recordId);
}

