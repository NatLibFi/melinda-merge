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

import { Map } from 'immutable'; 
import {RESET_WORKSPACE} from '../constants/action-type-constants';
import {LOAD_TARGET_RECORD, SET_TARGET_RECORD, SET_TARGET_RECORD_ERROR, SET_TARGET_RECORD_ID } from '../ui-actions';

const INITIAL_STATE = Map({
  state: 'EMPTY'
});


export default function targetRecord(state = INITIAL_STATE, action) {
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

export function loadTargetRecord(state, recordId) {
  return Map({
    id: recordId,
    state: 'LOADING'
  });
}

export function setTargetRecord(state, record) {

  return state
    .set('state', 'LOADED')
    .set('record', record);
}

export function setTargetRecordError(state, error) {
  return state
    .setIn(['state'], 'ERROR')
    .setIn(['errorMessage'], error);
}

export function setTargetRecordId(state, recordId) {
  return state.setIn(['id'], recordId);
}
