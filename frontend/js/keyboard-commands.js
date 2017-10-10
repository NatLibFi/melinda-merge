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

import { setEverySubrecordAction, setEveryMatchedSubrecordAction } from './action-creators/subrecord-actions';

export function initKeyboardListener(el, store) {

  function onKeyDown(keyEvent) {

    if (keyEvent.keyCode == 77 && keyEvent.ctrlKey) {
      store.dispatch(setEverySubrecordAction());
    }
    
    if (keyEvent.keyCode == 77 && keyEvent.altKey) {
      store.dispatch(setEveryMatchedSubrecordAction());
    }
    
  }

  el.addEventListener('keydown', onKeyDown);
}
