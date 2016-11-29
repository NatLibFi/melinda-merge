import sinon from 'sinon';
import _ from 'lodash';
import { expect } from 'chai';
import path from 'path';
import fs from 'fs';
import * as MarcRecordMergePostmergeService from './marc-record-merge-postmerge-service';
import { __RewireAPI__ as RewireAPI } from './marc-record-merge-postmerge-service';

import MarcRecord from 'marc-record-js';

const TEST_CASE_SEPARATOR = '\n\n\n\n';

const storiesPath = path.resolve(__dirname, '../test/marc-record-merge-postmerge-service');

describe('marc-record-merge-validate-service', () => {

  before(() => {
  
    const formatDateStub = sinon.stub();

    formatDateStub.returns('2016-11-29T13:25:21+02:00');

    RewireAPI.__Rewire__('formatDate', formatDateStub);
    
  });
  after(() => {
    RewireAPI.__ResetDependency__('formatDate');
  });

  const files = fs.readdirSync(storiesPath);
  const storyFiles = files.filter(filename => filename.substr(-6) === '.story').sort();
  
  storyFiles.map(loadStoriesFromFile).forEach(testSuite => {
    
    describe(testSuite.suiteName, () => {

      testSuite.testCases.forEach(testCase => {

        it(testCase.testName, () => {
          
          const {mergedRecord, notes} = testSuite.functionUnderTest.call(null, testCase.preferredRecord, testCase.otherRecord, testCase.mergedRecord);

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

      const otherRecordStartIndex = lines.indexOf('Other record:') + 1;
      const otherRecordRaw = lines.slice(otherRecordStartIndex, lines.indexOf('', otherRecordStartIndex)).join('\n');
      const otherRecord = MarcRecord.fromString(otherRecordRaw);

      const mergedRecordStartIndex = lines.indexOf('Merged record before postmerge:') + 1;
      const mergedRecordRaw = lines.slice(mergedRecordStartIndex, lines.indexOf('', mergedRecordStartIndex)).join('\n');
      const mergedRecord = MarcRecord.fromString(mergedRecordRaw);

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