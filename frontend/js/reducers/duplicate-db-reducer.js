/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records
*
* Copyright (C) 2015-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of marc-merge-ui
*
* marc-merge-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* oai-pmh-server-backend-module-melinda is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import { Map, fromJS } from 'immutable';
import { DuplicateDatabaseStates } from '../constants';

import {SKIP_PAIR_SUCCESS, SKIP_PAIR_ERROR, MARK_AS_NOT_DUPLICATE_SUCCESS, 
  MARK_AS_NOT_DUPLICATE_ERROR, MARK_AS_MERGED_SUCCESS, MARK_AS_MERGED_ERROR,
  MARK_AS_MERGED_START, MARK_AS_NOT_DUPLICATE_START, SKIP_PAIR_START} from '../constants/action-type-constants';

import {DUPLICATE_COUNT_SUCCESS, DUPLICATE_COUNT_ERROR, NEXT_DUPLICATE_START, NEXT_DUPLICATE_SUCCESS, NEXT_DUPLICATE_ERROR} from '../constants/action-type-constants';
import {RESET_WORKSPACE} from '../constants/action-type-constants';

import {SET_SOURCE_RECORD, SET_TARGET_RECORD} from '../ui-actions';
import _ from 'lodash';

const INITIAL_STATE = fromJS({
  count: 0,
  status: DuplicateDatabaseStates.READY,
  currentPair: Map()
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

    case SET_SOURCE_RECORD:
    case SET_TARGET_RECORD:
      return normalizeCurrentPair(state, action.recordId);

    case RESET_WORKSPACE:
      return state
        .set('currentPair', Map())
        .set('status', DuplicateDatabaseStates.READY);
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
    .set('currentPair', fromJS(pair))
    .set('status', DuplicateDatabaseStates.READY);
}

export function setDuplicateDatabaseControlsStatus(state, status) {
  return state
    .setIn(['status'], status);
}

export function setCurrentDuplicatePairError(state, error) {
  return state.setIn(['currentPairError'], error);
}

function normalizeCurrentPair(state, recordId) {



  const allowedValues = [
    state.getIn(['currentPair', 'preferredRecordId']),
    state.getIn(['currentPair', 'otherRecordId']),
    undefined
  ];

  if (_.includes(allowedValues, recordId)) {
    return state;
  } else {
    return state.set('currentPair', Map());
  }
}
