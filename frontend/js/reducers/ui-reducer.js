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
import { RESET_WORKSPACE, TOGGLE_COMPACT_SUBRECORD_VIEW, UPDATE_SUBRECORD_ARRANGEMENT } from '../constants/action-type-constants';

const INITIAL_STATE = Map({
  compactSubrecordView: false,
  compactedRows: []
});

export default function ui(state = INITIAL_STATE, action) {
  switch (action.type) {
    case RESET_WORKSPACE:
      return INITIAL_STATE;
    case TOGGLE_COMPACT_SUBRECORD_VIEW:
      return setCompactSubrecordView(state, action.enabled, action.rowsToCompact);
    case UPDATE_SUBRECORD_ARRANGEMENT:
      return setCompactSubrecordView(state, false, []);

  }
  return state;
}

function setCompactSubrecordView(state, isEnabled, rowsToCompact) {

  return state
    .set('compactSubrecordView', isEnabled)
    .set('compactedRows', rowsToCompact);
}
