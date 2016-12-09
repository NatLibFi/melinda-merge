import { Map } from 'immutable';
import { combineReducers } from 'redux-immutable';

import { RESET_STATE } from './ui-actions';

import session from 'commons/reducers/session-reducer';
import subrecords from './reducers/subrecord-reducer';
import duplicateDatabase from './reducers/duplicate-db-reducer';
import location from './reducers/location-reducer';
import sourceRecord from './reducers/source-record-reducer';
import targetRecord from './reducers/target-record-reducer';
import mergedRecord from './reducers/merged-record-reducer';
import mergeStatus from  './reducers/merge-status-reducer';
import ui from  './reducers/ui-reducer';

export const DEFAULT_MERGED_RECORD = Map({
  state: 'EMPTY',
});

export default function reducer(state = Map(), action) {
  if (action.type === RESET_STATE) {
    state = Map();
  }

  let rawState = combinedRootReducer(state, action);
  return normalizeMergedRecord(rawState);
}

export const combinedRootReducer = combineReducers({
  ui,
  location,
  session,
  duplicateDatabase,
  sourceRecord,
  targetRecord,
  mergedRecord,
  mergeStatus,
  subrecords
});

function normalizeMergedRecord(state) {
  const sourceRecordStatus = state.getIn(['sourceRecord', 'state']);
  const targetRecordStatus = state.getIn(['targetRecord', 'state']);

  if (sourceRecordStatus == 'LOADING' || targetRecordStatus == 'LOADING') {
    return state.set('mergedRecord', DEFAULT_MERGED_RECORD);
  }
  return state;
}
