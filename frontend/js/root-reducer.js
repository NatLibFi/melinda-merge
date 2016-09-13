import {fromJS} from 'immutable';

import {loadSourceRecord, setSourceRecord, loadTargetRecord, setTargetRecord, 
  loadTargetRecordError, setTargetRecordError, setTargetRecordId, setSourceRecordId,
  createSessionStart, createSessionError, createSessionSuccess, validateSessionStart, setLocation} from './ui-reducers';
import {LOAD_SOURCE_RECORD, SET_SOURCE_RECORD, SET_TARGET_RECORD, LOAD_TARGET_RECORD, 
  SET_SOURCE_RECORD_ERROR, SET_TARGET_RECORD_ERROR, SET_SOURCE_RECORD_ID, SET_TARGET_RECORD_ID,
  CREATE_SESSION_START, CREATE_SESSION_ERROR, CREATE_SESSION_SUCCESS, VALIDATE_SESSION_START, RESET_STATE, SET_LOCATION} from './ui-actions';


export const INITIAL_STATE = fromJS({
  sourceRecord: {
    state: 'EMPTY'
  },
  targetRecord: {
    state: 'EMPTY'
  },
  mergedRecord: {
    state: 'EMPTY'
  },
  sessionState: 'NO_SESSION'
});

function resetState() {
  return INITIAL_STATE;
}

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case LOAD_SOURCE_RECORD:
    return loadSourceRecord(state, action.id);
  case SET_SOURCE_RECORD:
    return setSourceRecord(state, action.record);
  case LOAD_TARGET_RECORD:
    return loadTargetRecord(state, action.id);
  case SET_TARGET_RECORD:
    return setTargetRecord(state, action.record);
  case SET_SOURCE_RECORD_ERROR:
    return loadTargetRecordError(state, action.error);
  case SET_TARGET_RECORD_ERROR:
    return setTargetRecordError(state, action.error);
  case SET_SOURCE_RECORD_ID:
    return setSourceRecordId(state, action.recordId);
  case SET_TARGET_RECORD_ID:
    return setTargetRecordId(state, action.recordId);
  case CREATE_SESSION_START:
    return createSessionStart(state);
  case CREATE_SESSION_ERROR:
    return createSessionError(state, action.message);
  case CREATE_SESSION_SUCCESS:
    return createSessionSuccess(state);
  case VALIDATE_SESSION_START:
    return validateSessionStart(state);
  case RESET_STATE:
    return resetState(state);
  case SET_LOCATION:
    return setLocation(state, action.location);
  }

  return state;
}
