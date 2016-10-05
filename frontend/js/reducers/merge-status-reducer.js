import { Map } from 'immutable'; 
import {RESET_WORKSPACE} from '../constants/action-type-constants';
import {COMMIT_MERGE_START, COMMIT_MERGE_ERROR, COMMIT_MERGE_SUCCESS } from '../ui-actions';

export default function mergeStatus(state = Map({}), action) {
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
