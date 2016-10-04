import { Map, fromJS } from 'immutable';
import { DuplicateDatabaseStates } from './constants';
import _ from 'lodash';
import { combineReducers } from 'redux-immutable';

import {loadSourceRecord, setSourceRecord, loadTargetRecord, setTargetRecord, 
  setSourceRecordError, setTargetRecordError, setTargetRecordId, setSourceRecordId} from './ui-reducers';
import {LOAD_SOURCE_RECORD, SET_SOURCE_RECORD, SET_TARGET_RECORD, LOAD_TARGET_RECORD, 
  SET_SOURCE_RECORD_ERROR, SET_TARGET_RECORD_ERROR, SET_SOURCE_RECORD_ID, SET_TARGET_RECORD_ID,
  CREATE_SESSION_START, CREATE_SESSION_ERROR, CREATE_SESSION_SUCCESS, VALIDATE_SESSION_START, RESET_STATE, SET_LOCATION} from './ui-actions';

import {createSessionStart, createSessionError, createSessionSuccess, validateSessionStart} from './reducers/session-reducer';
import {setLocation} from './reducers/location-reducer';

import {setMergedRecord, clearMergedRecord, setMergedRecordError} from './ui-reducers';
import {CLEAR_MERGED_RECORD, SET_MERGED_RECORD_ERROR, SET_MERGED_RECORD} from './ui-actions';

import {COMMIT_MERGE_START, COMMIT_MERGE_ERROR, COMMIT_MERGE_SUCCESS} from './ui-actions';
import {setMergeStatus} from './ui-reducers';

import {insertSubrecordRow, removeSubrecordRow, changeSourceSubrecordRow, changeTargetSubrecordRow, 
  setSubrecordAction, setMergedSubrecord, setMergedSubrecordError, changeSubrecordRow} from './reducers/subrecord-reducer';

import subrecords from './reducers/subrecord-reducer';
import session from './reducers/session-reducer';
import duplicateDatabase from './reducers/duplicate-db-reducer';
import location from './reducers/location-reducer';
import { sourceRecord, targetRecord, mergedRecord, mergeStatus } from './ui-reducers';


import {INSERT_SUBRECORD_ROW, REMOVE_SUBRECORD_ROW, CHANGE_SOURCE_SUBRECORD_ROW, CHANGE_TARGET_SUBRECORD_ROW, 
  SET_SUBRECORD_ACTION, SET_MERGED_SUBRECORD, SET_MERGED_SUBRECORD_ERROR, CHANGE_SUBRECORD_ROW} from './ui-actions';

import {DUPLICATE_COUNT_SUCCESS, DUPLICATE_COUNT_ERROR, RESET_WORKSPACE, NEXT_DUPLICATE_START, NEXT_DUPLICATE_SUCCESS, NEXT_DUPLICATE_ERROR} from './constants/action-type-constants';
import {setDuplicateCount, setDuplicateCountError, setDuplicateDatabaseControlsStatus, setCurrentDuplicatePair, setCurrentDuplicatePairError} from './reducers/duplicate-db-reducer';

import {SKIP_PAIR_SUCCESS, SKIP_PAIR_ERROR, MARK_AS_NOT_DUPLICATE_SUCCESS, 
  MARK_AS_NOT_DUPLICATE_ERROR, MARK_AS_MERGED_SUCCESS, MARK_AS_MERGED_ERROR,
  MARK_AS_MERGED_START, MARK_AS_NOT_DUPLICATE_START, SKIP_PAIR_START} from './constants/action-type-constants';

export const INITIAL_STATE = fromJS({
  sourceRecord: {
    state: 'EMPTY'
  },
  targetRecord: {
    state: 'EMPTY'
  },
  mergedRecord: {
    state: 'EMPTY',
  },
  duplicateDatabase: {
    count: 0,
    status: DuplicateDatabaseStates.READY
  },
  subrecords: {
    sourceRecord: [],
    targetRecord: [],
    mergedRecord: [],
    mergedRecordErrors: [],
    actions: []
  }
});

export const DEFAULT_MERGED_RECORD = Map({
  state: 'EMPTY',
});


function resetState() {
  return INITIAL_STATE;
}

function resetWorkspace(state) {
  return state
    .set('sourceRecord', INITIAL_STATE.get('sourceRecord'))
    .set('targetRecord', INITIAL_STATE.get('targetRecord'))
    .set('mergedRecord', INITIAL_STATE.get('mergedRecord'))
    .set('subrecords', INITIAL_STATE.get('subrecords'))
    .set('location', undefined)
    .set('mergeStatus', Map())
    .setIn(['duplicateDatabase', 'currentPair'], undefined);
}

export default function reducer(state = Map(), action) {

  let rawState = combinedRootReducer(state, action);

  return normalizeMergedRecord(normalizeMergeStatus(normalizeCurrentPair(rawState)));
}

console.log({
  location,
  session,
  duplicateDatabase,
  sourceRecord,
  targetRecord,
  mergedRecord,
  mergeStatus,
  subrecords
});

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

function rootReducer(state, action) {

  switch (action.type) {
  case LOAD_SOURCE_RECORD:
    return loadSourceRecord(state, action.id);
  case SET_SOURCE_RECORD:
    return setSourceRecord(state, action.record, action.subrecords);
  case LOAD_TARGET_RECORD:
    return loadTargetRecord(state, action.id);
  case SET_TARGET_RECORD:
    return setTargetRecord(state, action.record, action.subrecords);
  case SET_SOURCE_RECORD_ERROR:
    return setSourceRecordError(state, action.error);
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
  case RESET_WORKSPACE:
    return resetWorkspace(state);
  case SET_LOCATION:
    return setLocation(state, action.location);
  case CLEAR_MERGED_RECORD:
    return clearMergedRecord(state);
  case SET_MERGED_RECORD_ERROR:
    return setMergedRecordError(state, action.error);
  case SET_MERGED_RECORD:
    return setMergedRecord(state, action.record);
  case INSERT_SUBRECORD_ROW:
    return insertSubrecordRow(state, action.rowIndex);
  case REMOVE_SUBRECORD_ROW:
    return removeSubrecordRow(state, action.rowIndex);
  case CHANGE_SOURCE_SUBRECORD_ROW:
    return changeSourceSubrecordRow(state, action.fromRowIndex, action.toRowIndex);
  case CHANGE_TARGET_SUBRECORD_ROW:
    return changeTargetSubrecordRow(state, action.fromRowIndex, action.toRowIndex);
  case CHANGE_SUBRECORD_ROW: 
    return changeSubrecordRow(state, action.fromRowIndex, action.toRowIndex);

  case DUPLICATE_COUNT_SUCCESS:
    return setDuplicateCount(state, action.count);
  case DUPLICATE_COUNT_ERROR:
    return setDuplicateCountError(state, action.error);
  case NEXT_DUPLICATE_START:
    return setDuplicateDatabaseControlsStatus(state, DuplicateDatabaseStates.FETCH_NEXT_DUPLICATE_ONGOING);
  case NEXT_DUPLICATE_SUCCESS:
    return setCurrentDuplicatePair(state, action.pair);
  case NEXT_DUPLICATE_ERROR: 
    return setCurrentDuplicatePairError(state, action.error);
  
  case MARK_AS_MERGED_START:
    return setDuplicateDatabaseControlsStatus(state, DuplicateDatabaseStates.MARK_AS_MERGED_ONGOING);
  case MARK_AS_MERGED_SUCCESS:
    return setDuplicateDatabaseControlsStatus(state, DuplicateDatabaseStates.READY);
  case MARK_AS_MERGED_ERROR:
    return setDuplicateDatabaseControlsStatus(state, DuplicateDatabaseStates.READY);

  case MARK_AS_NOT_DUPLICATE_START:
    return setDuplicateDatabaseControlsStatus(state, DuplicateDatabaseStates.MARK_AS_NON_DUPLICATE_ONGOING);
  case MARK_AS_NOT_DUPLICATE_SUCCESS:
    return setDuplicateDatabaseControlsStatus(state, DuplicateDatabaseStates.READY);
  case MARK_AS_NOT_DUPLICATE_ERROR:
    return setDuplicateDatabaseControlsStatus(state, DuplicateDatabaseStates.READY);

  case SKIP_PAIR_START:
    return setDuplicateDatabaseControlsStatus(state, DuplicateDatabaseStates.SKIP_PAIR_ONGOING);
  case SKIP_PAIR_SUCCESS:
    return setDuplicateDatabaseControlsStatus(state, DuplicateDatabaseStates.READY);
  case SKIP_PAIR_ERROR:
    return setDuplicateDatabaseControlsStatus(state, DuplicateDatabaseStates.READY);

  case SET_SUBRECORD_ACTION:
    return setSubrecordAction(state, action.rowIndex, action.actionType);
  case SET_MERGED_SUBRECORD:
    return setMergedSubrecord(state, action.rowIndex, action.record);
  case SET_MERGED_SUBRECORD_ERROR:
    return setMergedSubrecordError(state, action.rowIndex, action.error);
  case COMMIT_MERGE_START:
    return setMergeStatus(state, {status: 'COMMIT_MERGE_ONGOING', message: 'Yhdistetään tietueita'});
  case COMMIT_MERGE_ERROR:
    return setMergeStatus(state, {status: 'COMMIT_MERGE_ERROR', message: action.error});
  case COMMIT_MERGE_SUCCESS:
    return setMergeStatus(state, {status: 'COMMIT_MERGE_COMPLETE', message: `Tietueet yhdistetty tietueeksi ${action.recordId}`});

  }

  return state;
}


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