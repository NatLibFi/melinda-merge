import { Map } from 'immutable';
import { DEFAULT_MERGED_RECORD } from './root-reducer';

import {LOAD_SOURCE_RECORD, SET_SOURCE_RECORD, SET_SOURCE_RECORD_ERROR, SET_SOURCE_RECORD_ID } from './ui-actions';
import {RESET_WORKSPACE} from './constants/action-type-constants';


const INITIAL_STATE = Map({
  state: 'EMPTY'
});

export function sourceRecord(state = INITIAL_STATE, action) {
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

import {LOAD_TARGET_RECORD, SET_TARGET_RECORD, SET_TARGET_RECORD_ERROR, SET_TARGET_RECORD_ID } from './ui-actions';

export function targetRecord(state = INITIAL_STATE, action) {
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

import {CLEAR_MERGED_RECORD, SET_MERGED_RECORD_ERROR, SET_MERGED_RECORD } from './ui-actions';

export function mergedRecord(state = INITIAL_STATE, action) {
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

import {COMMIT_MERGE_START, COMMIT_MERGE_ERROR, COMMIT_MERGE_SUCCESS } from './ui-actions';

export function mergeStatus(state = Map({}), action) {
  switch (action.type) {
  case COMMIT_MERGE_START:
    return setMergeStatus(state, {status: 'COMMIT_MERGE_ONGOING', message: 'Yhdistetään tietueita'});
  case COMMIT_MERGE_ERROR:
    return setMergeStatus(state, {status: 'COMMIT_MERGE_ERROR', message: action.error});
  case COMMIT_MERGE_SUCCESS:
    return setMergeStatus(state, {status: 'COMMIT_MERGE_COMPLETE', message: `Tietueet yhdistetty tietueeksi ${action.recordId}`});
  case RESET_WORKSPACE:
    return Map({});
  }
  return state;
}

export function setMergeStatus(state, mergeStatus) {
  const mergeAvailable = mergeStatus.status == 'COMMIT_MERGE_ERROR' ? 'COMMIT_MERGE_AVAILABLE' : 'COMMIT_MERGE_DISABLED';

  return Map({
    status: mergeAvailable,
    message: mergeStatus.message
  });
}

export function loadSourceRecord(state, recordId) {
  return Map({
    id: recordId,
    state: 'LOADING'
  });
  
}

export function loadTargetRecord(state, recordId) {
  return Map({
    id: recordId,
    state: 'LOADING'
  });
}

export function setSourceRecord(state, record) {
  
  return state
    .updateIn(['state'], () => 'LOADED')
    .updateIn(['record'], () => record);
    //.setIn(['subrecords', 'sourceRecord'], List(subrecords)); // TODO move to subrecord reducer
}

export function setTargetRecord(state, record) {

  return state
    .set('state', 'LOADED')
    .set('record', record);
    //.setIn(['subrecords', 'targetRecord'], List(subrecords)); // TODO move to subrecord reducer
}

export function setMergedRecord(state, record) {

  return state
    .updateIn(['state'], () => 'LOADED')
    .updateIn(['record'], () => record);
   // .updateIn(['subrecords', 'mergedRecord'], () => List()) // TODO move to subrecord reducer
   // .updateIn(['subrecords', 'actions'], () => List()); // TODO move to subrecord reducer
}

export function clearMergedRecord(state) {
  return DEFAULT_MERGED_RECORD;
}

export function setMergedRecordError(state, errorMessage) {
  return state
    .updateIn(['state'], () => 'ERROR')
    .updateIn(['errorMessage'], () => errorMessage);
}

export function setTargetRecordError(state, error) {
  return state
    .setIn(['state'], 'ERROR')
    .setIn(['errorMessage'], error);
}

export function setSourceRecordError(state, error) {
  return state
    .setIn(['state'], 'ERROR')
    .setIn(['errorMessage'], error);
}

export function setTargetRecordId(state, recordId) {
  return state.setIn(['id'], recordId);
}

export function setSourceRecordId(state, recordId) {
  return state.setIn(['id'], recordId);
}
