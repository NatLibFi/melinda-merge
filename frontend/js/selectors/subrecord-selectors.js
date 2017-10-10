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

import _ from 'lodash';
import { createSelector } from 'reselect';

export const subrecordOrder = state => state.getIn(['subrecords', 'index']).toJS();
export const subrecords = state => state.get('subrecords').delete('index').toJS();

export const subrecordRows = createSelector(
  [subrecordOrder, subrecords], (index, subrecords) => {

    return index.map(key => {
      return subrecords[key];
    });

  }
);

export const sourceSubrecords = createSelector([subrecordRows], (subrecordRows) => _.chain(subrecordRows).map('sourceRecord').compact().value());
export const targetSubrecords = createSelector([subrecordRows], (subrecordRows) => _.chain(subrecordRows).map('targetRecord').compact().value());

export const sourceHasSubrecords = createSelector([sourceSubrecords], (sourceSubrecords) => sourceSubrecords.length > 0);
export const targetHasSubrecords = createSelector([targetSubrecords], (targetSubrecords) => targetSubrecords.length > 0);

export const eitherHasSubrecords = createSelector([sourceHasSubrecords, targetHasSubrecords], (source, target) => {
  return source || target;
});

export const rowsWithResultRecord = createSelector([subrecordRows], (subrecordRows) => {
  return subrecordRows.filter(row => row.mergedRecord !== undefined);
});