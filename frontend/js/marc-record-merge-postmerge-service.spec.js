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

import sinon from 'sinon';
import _ from 'lodash';
import { expect } from 'chai';
import path from 'path';
import fs from 'fs';
import * as MarcRecordMergePostmergeService from './marc-record-merge-postmerge-service';
import { __RewireAPI__ as RewireAPI } from './marc-record-merge-postmerge-service';
import { decorateFieldsWithUuid } from './record-utils';
import uuid from 'uuid';

import MarcRecord from 'marc-record-js';

const TEST_CASE_SEPARATOR = '\n\n\n\n';

const storiesPath = path.resolve(__dirname, '../test/marc-record-merge-postmerge-service');

describe('marc-record-merge-validate-service', () => {

  before(() => {
  
    const formatDateStub = sinon.stub();

    formatDateStub.returns('2016-11-29T13:25:21+02:00');

    RewireAPI.__Rewire__('formatDate', formatDateStub);

    // Prepare select773 fields with host record ids. The test runner is used to test the prepared function.
    MarcRecordMergePostmergeService.preparedSelect773Fields = MarcRecordMergePostmergeService.select773Fields('00001', '00002');
    
  });
  after(() => {
    RewireAPI.__ResetDependency__('formatDate');
    delete(MarcRecordMergePostmergeService.preparedSelect773Fields);
  });

  const files = fs.readdirSync(storiesPath);
  const storyFiles = files.filter(filename => filename.substr(-6) === '.story').sort();
  
  storyFiles.map(loadStoriesFromFile).forEach(testSuite => {
    
    describe(testSuite.suiteName, () => {

      testSuite.testCases.forEach(testCase => {

        it(testCase.testName, () => {
          
          const functionUnderTest = prepareTestFunction(testSuite.functionUnderTest);

          const {mergedRecord, notes} = functionUnderTest.call(null, testCase.preferredRecord, testCase.otherRecord, testCase.mergedRecord);
          expect(mergedRecord.toString()).to.eql(testCase.expectedMergedRecord.toString());
          expect(notes || []).to.eql(testCase.notes);
          
        });
      });
    });
  });

  describe('applyPostMergeModifications', () => {
    const validateStoriesText = fs.readFileSync(path.resolve(storiesPath, 'applyPostMergeModifications.stories'), 'utf8');
    const validateMergeCandidatesTestCases = parseStories(validateStoriesText);

    validateMergeCandidatesTestCases.forEach(testCase => {

      it(testCase.testName, () => {

        const postMergeFixers = MarcRecordMergePostmergeService.preset.defaults;
        const {record, notes} = MarcRecordMergePostmergeService.applyPostMergeModifications(postMergeFixers, testCase.preferredRecord, testCase.otherRecord, testCase.mergedRecord);

        expect(record.toString()).to.eql(testCase.expectedMergedRecord.toString());
        expect(notes).to.eql(testCase.notes);

      });
    });
  });
});

function prepareTestFunction(testFn) {
  return testFn === MarcRecordMergePostmergeService.select773Fields ? MarcRecordMergePostmergeService.select773Fields('00001', '00002') : testFn;
}

function loadStoriesFromFile(filename) {
  
  const storyText = fs.readFileSync(path.resolve(storiesPath, filename), 'utf8');

  const fnName = filename.slice(0, -6);
  const functionUnderTest = MarcRecordMergePostmergeService[fnName];
  const suiteName = fnName;

  const testCases = parseStories(storyText);
  return {suiteName, functionUnderTest, testCases};

}

function parseStories(storyText) {
  return storyText.split(TEST_CASE_SEPARATOR)
    .map(story => story.trim())
    .map(story => {
      const lines = story.split('\n').map(line => line.trim());
      const testName = lines[0];
      const preferredRecordRaw = lines.slice(2, lines.indexOf('')).join('\n');
      const preferredRecord = MarcRecord.fromString(preferredRecordRaw);
      decorateFieldsWithUuid(preferredRecord);

      const otherRecordStartIndex = lines.indexOf('Other record:') + 1;
      const otherRecordRaw = lines.slice(otherRecordStartIndex, lines.indexOf('', otherRecordStartIndex)).join('\n');
      const otherRecord = MarcRecord.fromString(otherRecordRaw);
      decorateFieldsWithUuid(otherRecord);

      const mergedRecordStartIndex = lines.indexOf('Merged record before postmerge:') + 1;
      const mergedRecordRaw = lines.slice(mergedRecordStartIndex, lines.indexOf('', mergedRecordStartIndex)).join('\n');
      const mergedRecord = MarcRecord.fromString(mergedRecordRaw);

      // Mark merged record fields with uuids from preferred,other fields if they are identical.
      mergedRecord.fields.forEach(field => {
        const equalFieldsInPreferred = preferredRecord.fields.filter(f => fieldsEqual(field, f));
        const equalFieldsInOther = otherRecord.fields.filter(f => fieldsEqual(field, f));

        const uuidCandidates = _.concat(equalFieldsInPreferred, equalFieldsInOther).map(field => field.uuid);
        field.uuid = _.get(uuidCandidates, '[0]', uuid.v4());
      });

      const expectedMergedRecordStartIndex = lines.indexOf('Expected record after postmerge:') + 1;
      const expectedMergedRecordEndIndex = lines.indexOf('', expectedMergedRecordStartIndex) === -1 ? lines.length : lines.indexOf('', expectedMergedRecordStartIndex);
      const expectedMergedRecordRaw = lines.slice(expectedMergedRecordStartIndex, expectedMergedRecordEndIndex).join('\n');
      const expectedMergedRecord = MarcRecord.fromString(expectedMergedRecordRaw);

      const notes = _.chain(lines)
        .map(line => /Notes:\s*(.*)/.exec(line))
        .filter(matchResult => matchResult !== null)
        .map(matchResult => matchResult[1])
        .value();

      return { testName, preferredRecord, otherRecord, mergedRecord, expectedMergedRecord, notes };
    });

}

function fieldsEqual(fieldA, fieldB) {
  if (fieldA.tag !== fieldB.tag) return false;
  if (fieldA.ind1 !== fieldB.ind1) return false;
  if (fieldA.ind2 !== fieldB.ind2) return false;
  if (fieldA.subfields && fieldB.subfields) {
    return _.zip(fieldA.subfields, fieldB.subfields).every(pair => {
      return pair[0].code === pair[1].code && pair[0].value === pair[1].value;
    });

  } else {
    return fieldA.value === fieldB.value;
  }

}