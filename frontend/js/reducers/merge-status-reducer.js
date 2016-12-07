import { Map } from 'immutable'; 
import {RESET_WORKSPACE} from '../constants/action-type-constants';
import { CommitMergeStates } from '../constants';
import {COMMIT_MERGE_START, COMMIT_MERGE_ERROR, COMMIT_MERGE_SUCCESS, CLOSE_MERGE_DIALOG, SET_TARGET_RECORD, SET_SOURCE_RECORD } from '../ui-actions';

const INITIAL_STATE = Map({
  dialog: Map({
    visible: false,
    closable: false
  }),
  status: CommitMergeStates.COMMIT_MERGE_NOT_STARTED
});

export default function mergeStatus(state = INITIAL_STATE, action) {
  switch (action.type) {
    case COMMIT_MERGE_START:
      state = setMergeStatus(state, CommitMergeStates.COMMIT_MERGE_ONGOING, 'Yhdistetään tietueita');
      state = showDialog(state, true);
      return enableCloseDialog(state, false);
    case COMMIT_MERGE_ERROR:
      state = setMergeStatus(state, CommitMergeStates.COMMIT_MERGE_ERROR, action.error, action.response);
      return enableCloseDialog(state, true);
    case COMMIT_MERGE_SUCCESS:
      state = setMergeStatus(state, CommitMergeStates.COMMIT_MERGE_COMPLETE, `Tietueet yhdistetty tietueeksi ${action.recordId}`, action.response);
      return enableCloseDialog(state, true);
    case CLOSE_MERGE_DIALOG:
      return showDialog(state, false);
    case SET_TARGET_RECORD:
    case SET_SOURCE_RECORD:
    case RESET_WORKSPACE:
      return INITIAL_STATE;
  }
  return state;
}

export function setMergeStatus(state, status, message, response) {
  return state
    .set('status', status)
    .set('message', message)
    .set('response', response);
}

export function showDialog(state, visible) {
  return state
    .setIn(['dialog', 'visible'], visible);
}

export function enableCloseDialog(state, closable) {
  return state
    .setIn(['dialog', 'closable'], closable);
}
