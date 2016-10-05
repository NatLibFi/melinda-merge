import { Map } from 'immutable';
import _ from 'lodash';
import { combineReducers } from 'redux-immutable';

import { RESET_STATE } from './ui-actions';

import subrecords from './reducers/subrecord-reducer';
import session from './reducers/session-reducer';
import duplicateDatabase from './reducers/duplicate-db-reducer';
import location from './reducers/location-reducer';
import sourceRecord from './reducers/source-record-reducer';
import targetRecord from './reducers/target-record-reducer';
import mergedRecord from './reducers/merged-record-reducer';
import mergeStatus from  './reducers/merge-status-reducer';

export const DEFAULT_MERGED_RECORD = Map({
  state: 'EMPTY',
});

export default function reducer(state = Map(), action) {
  if (action.type === RESET_STATE) {
    return Map();
  }

  let rawState = combinedRootReducer(state, action);

  return normalizeMergedRecord(normalizeMergeStatus(normalizeCurrentPair(rawState)));
}

export const combinedRootReducer = combineReducers({
  location,
  session,
  duplicateDatabase,
  sourceRecord,
  targetRecord,
  mergedRecord,
  mergeStatus,
  subrecords
});

function normalizeMergeStatus(state) {
  const mergedRecordState = state.getIn(['mergedRecord', 'state']);
  if (mergedRecordState === 'LOADED') {
    return state.setIn(['mergeStatus', 'status'], 'COMMIT_MERGE_AVAILABLE');
  } else {
    return state.setIn(['mergeStatus', 'status'], 'COMMIT_MERGE_DISABLED');
  }
}

function normalizeCurrentPair(state) {
  const sourceRecordId = state.getIn(['sourceRecord', 'id']);
  const targetRecordId = state.getIn(['targetRecord', 'id']);

  const allowedValues = [
    state.getIn(['duplicateDatabase', 'currentPair', 'preferredRecordId']),
    state.getIn(['duplicateDatabase', 'currentPair', 'otherRecordId']),
    undefined
  ];

  if (_.includes(allowedValues, sourceRecordId) && _.includes(allowedValues, targetRecordId)) {
    return state;
  } else {
    return state.setIn(['duplicateDatabase', 'currentPair'], Map());
  }
}

function normalizeMergedRecord(state) {
  const sourceRecordStatus = state.getIn(['sourceRecord', 'state']);
  const targetRecordStatus = state.getIn(['targetRecord', 'state']);

  if (sourceRecordStatus == 'LOADING' || targetRecordStatus == 'LOADING') {
    return state.set('mergedRecord', DEFAULT_MERGED_RECORD);
  }
  return state;
}
