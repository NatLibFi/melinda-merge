import {fromJS} from 'immutable';
/*
import {DUPLICATE_COUNT_SUCCESS, DUPLICATE_COUNT_ERROR, NEXT_DUPLICATE_SUCCESS, NEXT_DUPLICATE_ERROR} from '../constants/action-type-constants';

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
const INITIAL_STATE = fromJS({
  count: undefined
});

export default function duplicateDatabaseReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case DUPLICATE_COUNT_SUCCESS:
    return setDuplicateCount(state, action.count);
  case DUPLICATE_COUNT_ERROR:
    return setDuplicateCountError(state, action.error);
  }
  return state;    
}
*/

export function setDuplicateCount(state, duplicateCount) {
  return state.setIn(['duplicateDatabase', 'count'], duplicateCount);
}
export function setDuplicateCountError(state, error) {
  return state.setIn(['duplicateDatabase', 'countError'], error);
}
export function setCurrentDuplicatePair(state, pair) {
  return state
    .setIn(['duplicateDatabase', 'currentPair'], fromJS(pair))
    .setIn(['duplicateDatabase', 'status'], 'READY');
}

export function setDuplicateDatabaseControlsStatus(state, status) {
  return state
    .setIn(['duplicateDatabase', 'status'], status);
}

export function setCurrentDuplicatePairError(state, error) {
  return state.setIn(['duplicateDatabase', 'currentPairError'], error);
}
