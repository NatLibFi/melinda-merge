import {Map} from 'immutable';

import {loadSourceRecord, setSourceRecord} from './ui-reducers';
import {LOAD_SOURCE_RECORD, SET_SOURCE_RECORD} from './ui-actions';

const INITIAL_STATE = Map();

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case LOAD_SOURCE_RECORD:
    return loadSourceRecord(state, action.id);
  case SET_SOURCE_RECORD:
    return setSourceRecord(state, action.record);
  }
  return state;
}
