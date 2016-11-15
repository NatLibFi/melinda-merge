import { Map } from 'immutable'; 
import {RESET_WORKSPACE} from '../constants/action-type-constants';
import {LOAD_TARGET_RECORD, SET_TARGET_RECORD, SET_TARGET_RECORD_ERROR, SET_TARGET_RECORD_ID } from '../ui-actions';

const INITIAL_STATE = Map({
  state: 'EMPTY'
});


export default function targetRecord(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD_TARGET_RECORD:
      return loadTargetRecord(state, action.id);
    case SET_TARGET_RECORD:
      return setTargetRecord(state, action.record, action.subrecords);
    case SET_TARGET_RECORD_ERROR:
      return setTargetRecordError(state, action.error);
    case SET_TARGET_RECORD_ID:
      return setTargetRecordId(state, action.recordId);
    case RESET_WORKSPACE:
      return INITIAL_STATE;
  }
  return state;
}

export function loadTargetRecord(state, recordId) {
  return Map({
    id: recordId,
    state: 'LOADING'
  });
}

export function setTargetRecord(state, record) {

  return state
    .set('state', 'LOADED')
    .set('record', record);
}

export function setTargetRecordError(state, error) {
  return state
    .setIn(['state'], 'ERROR')
    .setIn(['errorMessage'], error);
}

export function setTargetRecordId(state, recordId) {
  return state.setIn(['id'], recordId);
}
