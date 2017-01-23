import _ from 'lodash';
import { expect } from 'chai';
import path from 'path';
import fs from 'fs';
import * as MarcRecordMergeValidateService from './marc-record-merge-validate-service';
import MarcRecord from 'marc-record-js';

const TEST_CASE_SEPARATOR = '\n\n\n\n';

const storiesPath = path.resolve(__dirname, '../test/marc-record-merge-validate-service');

describe('marc-record-merge-validate-service', () => {

  const files = fs.readdirSync(storiesPath);
  const storyFiles = files.filter(filename => filename.substr(-6) === '.story').sort();
  
  storyFiles.map(loadStoriesFromFile).forEach(testSuite => {
    
    describe(testSuite.suiteName, () => {

      testSuite.testCases.forEach(testCase => {

        it(testCase.testName, () => {
            
          const {valid, validationFailureMessage} = testSuite.functionUnderTest.call(null, testCase.preferredRecord, testCase.otherRecord);

          expect(valid, `Expected test case validation to be ${testCase.isValid}`).to.equal(testCase.isValid);
          if (testCase.isValid === false) {
            expect(validationFailureMessage).to.equal(testCase.failureMessage);
          }
          
        });
      });
    });
  });

  describe('validateMergeCandidates', () => {
    const validateStoriesText = fs.readFileSync(path.resolve(storiesPath, 'validateMergeCandidates.stories'), 'utf8');
    const validateMergeCandidatesTestCases = parseStories(validateStoriesText);
    const allValidations = _.concat(MarcRecordMergeValidateService.preset.melinda_host, MarcRecordMergeValidateService.preset.melinda_warnings);

    validateMergeCandidatesTestCases.forEach(testCase => {
      let result;
      let error;
      before(() => {
        return MarcRecordMergeValidateService.validateMergeCandidates(allValidations, testCase.preferredRecord, testCase.otherRecord)
          .then(_result => result = _result)
          .catch(_error => error = _error);
      });

      it(testCase.testName, () => {

        if (testCase.isValid) {
          expect(result.valid, `Expected test case validation to be ${testCase.isValid}`).to.equal(testCase.isValid);
        } else {
          expect(error.message).to.equal('Merge validation failed');
          expect(error.failureMessages).to.eql(testCase.failureMessages);
        }
        
      });

        
    });

  });

});

function loadStoriesFromFile(filename) {
  
  const storyText = fs.readFileSync(path.resolve(storiesPath, filename), 'utf8');

  const fnName = filename.slice(0, -6);
  const functionUnderTest = MarcRecordMergeValidateService[fnName];
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

      const isValid = _.chain(lines)
        .map(line => /Expected to be valid:\s*(true|false)/.exec(line))
        .filter(matchResult => matchResult !== null)
        .map(matchResult => matchResult[1])
        .map(boolAsString => boolAsString === 'true')
        .head()
        .value();

      const failureMessages = _.chain(lines)
        .map(line => /Expected failure message:\s*(.*)/.exec(line))
        .filter(matchResult => matchResult !== null)
        .map(matchResult => matchResult[1])
        .value();

      const failureMessage = _.head(failureMessages);


      return { testName, preferredRecord, otherRecord, isValid, failureMessage, failureMessages };
    });

}