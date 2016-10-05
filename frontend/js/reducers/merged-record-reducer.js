import { Map } from 'immutable'; 
import {CLEAR_MERGED_RECORD, SET_MERGED_RECORD_ERROR, SET_MERGED_RECORD } from '../ui-actions';
import {RESET_WORKSPACE} from '../constants/action-type-constants';
import { DEFAULT_MERGED_RECORD } from '../root-reducer';

const INITIAL_STATE = Map({
  state: 'EMPTY'
});

export default function mergedRecord(state = INITIAL_STATE, action) {
  switch (action.type) {
  case CLEAR_MERGED_RECORD:
    return clearMergedRecord(state);
  case SET_MERGED_RECORD_ERROR:
    return setMergedRecordError(state, action.error);
  case SET_MERGED_RECORD:
    return setMergedRecord(state, action.record);
  case RESET_WORKSPACE:
    return INITIAL_STATE;
  }
  return state;
}

export function setMergedRecord(state, record) {

  return state
    .updateIn(['state'], () => 'LOADED')
    .updateIn(['record'], () => record);
   // .updateIn(['subrecords', 'mergedRecord'], () => List()) // TODO move to subrecord reducer
   // .updateIn(['subrecords', 'actions'], () => List()); // TODO move to subrecord reducer
}

export function clearMergedRecord() {
  return DEFAULT_MERGED_RECORD;
}

export function setMergedRecordError(state, errorMessage) {
  return state
    .updateIn(['state'], () => 'ERROR')
    .updateIn(['errorMessage'], () => errorMessage);
}

