import {fromJS} from 'immutable';

import {loadSourceRecord, setSourceRecord, loadTargetRecord, setTargetRecord, loadTargetRecordError, setTargetRecordError} from './ui-reducers';
import {LOAD_SOURCE_RECORD, SET_SOURCE_RECORD, SET_TARGET_RECORD, LOAD_TARGET_RECORD, SET_SOURCE_RECORD_ERROR, SET_TARGET_RECORD_ERROR} from './ui-actions';

export const INITIAL_STATE = fromJS({
  sourceRecord: {
    state: 'EMPTY'
  },
  targetRecord: {
    state: 'EMPTY'
  }
});

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
  }
  return state;
}
