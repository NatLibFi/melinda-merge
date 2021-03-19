/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Melinda record matching modules for Javascript
*
* Copyright (C) 2021 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-record-matching-js
*
* melinda-record-matching-js program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-record-matching-js is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import generateTests from '@natlibfi/fixugen';
import {READERS} from '@natlibfi/fixura';
import {expect} from 'chai';
import {MarcRecord} from '@natlibfi/marc-record';
import {match} from './component-record-match-service';

generateTests({
  path: [__dirname, '..', 'test', 'component-record-match-service'],
  useMetadataFile: true,
  recurse: false,
  callback});

function callback ({getFixture, expectedResults, enabled = true}) {

  if (!enabled) {
    return;
  }

  const recordSetA =  getFixture({components: ['recordSetAconv.json'], reader: READERS.JSON});
  const recordSetB = getFixture({components: ['recordSetBconv.json'], reader: READERS.JSON});

  const recordsA = recordSetA.map(json => new MarcRecord(json, {subfieldValues: false}));
  const recordsB = recordSetB.map(json => new MarcRecord(json, {subfieldValues: false}));

  const results = match(recordsA, recordsB);

  const resultsIds = results.map(pair => {
    return [getRecordId(pair[0]), getRecordId(pair[1])];
  });

  // eslint-disable-next-line no-console
  // console.log(JSON.stringify(resultsIds));

  expect(resultsIds).to.eql(expectedResults);
}

function getRecordId(record) {
  if (record) {
    const [field] = record.get(/^001$/u);
    return field ? field.value : '';
  }
  return '';
}