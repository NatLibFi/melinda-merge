import {fromJS} from 'immutable';
import { DuplicateDatabaseStates } from '../constants';

import {SKIP_PAIR_SUCCESS, SKIP_PAIR_ERROR, MARK_AS_NOT_DUPLICATE_SUCCESS, 
  MARK_AS_NOT_DUPLICATE_ERROR, MARK_AS_MERGED_SUCCESS, MARK_AS_MERGED_ERROR,
  MARK_AS_MERGED_START, MARK_AS_NOT_DUPLICATE_START, SKIP_PAIR_START} from '../constants/action-type-constants';

import {DUPLICATE_COUNT_SUCCESS, DUPLICATE_COUNT_ERROR, NEXT_DUPLICATE_START, NEXT_DUPLICATE_SUCCESS, NEXT_DUPLICATE_ERROR} from '../constants/action-type-constants';
import {RESET_WORKSPACE} from '../constants/action-type-constants';

/*
import {List, Map} from 'immutable';
import _ from 'lodash';
*/
/*
count:

currentPair: {
  id:
  src:
  tgt:
  message:
  createdAt
}

 */
/*
*/

const INITIAL_STATE = fromJS({
  count: 0,
  status: DuplicateDatabaseStates.READY
});

export default function duplicateDatabaseReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  
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

  case RESET_WORKSPACE:
    return state.setIn(['currentPair'], undefined);
  }

  return state;    
}


export function setDuplicateCount(state, duplicateCount) {
  return state.setIn(['count'], duplicateCount);
}
export function setDuplicateCountError(state, error) {
  return state.setIn(['countError'], error);
}
export function setCurrentDuplicatePair(state, pair) {
  return state
    .setIn(['currentPair'], fromJS(pair))
    .setIn(['status'], 'READY');
}

export function setDuplicateDatabaseControlsStatus(state, status) {
  return state
    .setIn(['status'], status);
}

export function setCurrentDuplicatePairError(state, error) {
  return state.setIn(['currentPairError'], error);
}
