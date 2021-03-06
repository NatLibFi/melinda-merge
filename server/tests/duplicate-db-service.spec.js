/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records in Melinda
*
* Copyright (C) 2015-2018 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-merge
*
* melinda-merge program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-merge is distributed in the hope that it will be useful,
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
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { getDuplicateCount, getNextDuplicatePair, markDuplicatePairAsMerged, skipPair, markPairAsNotDuplicates } from '../duplicate-db-service';
import { __RewireAPI__ as ComponentRewireAPI } from '../duplicate-db-service';

chai.use(sinonChai);
const expect = chai.expect;

const TEST_DUPLICATE_COUNT = 123;
const TEST_USER_NAME = 'test-user';

describe('Duplicate database service', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
    ComponentRewireAPI.__Rewire__('fetch', fetchStub);
   
  });
  afterEach(() => {
    ComponentRewireAPI.__ResetDependency__('fetch');
  });

  describe('getDuplicateCount', () => {

    it('returns duplicate count', (done) => {

      fetchStub.resolves(createStubFetchResponse(200, {message: TEST_DUPLICATE_COUNT}));

      getDuplicateCount().then(count => {
        expect(count).to.equal(TEST_DUPLICATE_COUNT);
        done();
      }).catch(done);
    });

    it('returns error if fetch fails', (done) => {

      fetchStub.resolves(createStubFetchResponse(500, {message: 'error'}));

      getDuplicateCount().then(expectFailure).catch(error => {
        try {
          expect(error.message).to.equal('Error loading duplicate count: 500');
        } catch(assertionError) {
          return done(assertionError); 
        }
        done();
      });
    });

  });

  describe('getNextDuplicatePair', () => {

    it('returns next pair', (done) => {

      const pairMetadata = {
        rec_id_1: '000223231',
        rec_id_2: '000053466',
        id: 123,
        created: '',
        system_message: 'Message about the duplicate pair'
      };

      fetchStub.resolves(createStubFetchResponse(200, {message: pairMetadata}));

      getNextDuplicatePair(TEST_USER_NAME).then(nextPairMetadata => {
        expect(nextPairMetadata).to.eql({
          'created': '',
          'duplicatePairId': 123,
          'otherRecordId': '000053466',
          'preferredRecordId': '000223231',
          'systemMessage': 'Message about the duplicate pair',
        });
        done();
      }).catch(done);
    });

    it('returns error if fetch fails', (done) => {

      fetchStub.resolves(createStubFetchResponse(500, {message: 'error'}));

      getNextDuplicatePair(TEST_USER_NAME).then(expectFailure).catch(error => {
        try {
          expect(error.message).to.equal(`Error loading next duplicate pair for ${TEST_USER_NAME}`);
        } catch(assertionError) {
          return done(assertionError); 
        }
        done();
      });
    });

  });


  describe('markDuplicatePairAsMerged', () => {

    it('returns ok if successful', (done) => {

      fetchStub.resolves(createStubFetchResponse(200));

      markDuplicatePairAsMerged(TEST_USER_NAME, '000223231', '000053466', 123).then(() => {
        done();
      }).catch(done);

    });

    it('returns error if fetch fails', (done) => {

      fetchStub.resolves(createStubFetchResponse(500, {message: 'error'}));

      markDuplicatePairAsMerged(TEST_USER_NAME, '000223231', '000053466', 123).then(expectFailure).catch(error => {
        try {
          expect(error.message).to.equal('Error marking pair as merged: 500');
        } catch(assertionError) {
          return done(assertionError); 
        }
        done();
      });
    });
  });


  describe('skipPair', () => {

    it('returns ok if successful', (done) => {

      fetchStub.resolves(createStubFetchResponse(200));

      skipPair(TEST_USER_NAME, 123).then(() => {
        done();
      }).catch(done);

    });

    it('returns error if fetch fails', (done) => {

      fetchStub.resolves(createStubFetchResponse(500, {message: 'error'}));

      skipPair(TEST_USER_NAME, 123).then(expectFailure).catch(error => {
        try {
          expect(error.message).to.equal('Error skipping pair: 500');
        } catch(assertionError) {
          return done(assertionError); 
        }
        done();
      });
    });
  });


  describe('markPairAsNotDuplicates', () => {

    it('returns ok if successful', (done) => {

      fetchStub.resolves(createStubFetchResponse(200));

      markPairAsNotDuplicates(TEST_USER_NAME, 123).then(() => {
        done();
      }).catch(done);

    });

    it('returns error if fetch fails', (done) => {

      fetchStub.resolves(createStubFetchResponse(500, {message: 'error'}));

      markPairAsNotDuplicates(TEST_USER_NAME, 123).then(expectFailure).catch(error => {
        try {
          expect(error.message).to.equal('Error marking pair as non-duplicate: 500');
        } catch(assertionError) {
          return done(assertionError); 
        }
        done();
      });
    });
  });
});

function expectFailure(done) {
  return function() {
    done(new Error('Done called when failure was expected'));
  };
}

function createStubFetchResponse(status, response) {
  response = response || {};
  response.success = response.success !== false ? true : false;

  return {
    status: status,
    json: sinon.stub().resolves(response)
  };
}