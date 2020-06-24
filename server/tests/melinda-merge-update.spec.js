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
chai.use(sinonChai);
const expect = chai.expect;
import {commitMerge} from '../melinda-merge-update';
import {__RewireAPI__ as RewireAPI} from '../melinda-merge-update';
import {MarcRecord} from '@natlibfi/marc-record';

MarcRecord.setValidationOptions({fields: false, subfields: false, subfieldValues: false});

describe('melinda merge update', function () {
  describe('commitMerge', function () {
    let clientStub;
    let loggerStub;

    beforeEach(() => {
      clientStub = {
        update: sinon.stub(),
        create: sinon.stub()
      };

      loggerStub = {log: sinon.stub()};

      RewireAPI.__Rewire__('logger', loggerStub);
    });

    afterEach(() => {
      RewireAPI.__ResetDependency__('logger');
    });

    it('requires that preferred main record has id', (done) => {
      const [preferred, other, merged, unmodified] = [createRecordFamily(), createRecordFamily(), createRecordFamily(), createRecordFamily()];

      commitMerge(clientStub, preferred, other, merged, unmodified)
        .then(expectFulfillmentToNotBeCalled(done))
        .catch(expectErrorMessage('Id not found for preferred record.', done));
    });

    it('requires that other main record has id', (done) => {

      const [preferred, other, merged, unmodified] = [createRandomRecordFamily(), createRecordFamily(), createRecordFamily(), createRecordFamily()];

      commitMerge(clientStub, preferred, other, merged, unmodified)
        .then(expectFulfillmentToNotBeCalled(done))
        .catch(expectErrorMessage('Id not found for other record.', done));

    });

    it('requires that preferred subrecords have ids', (done) => {

      const [preferred, other, merged, unmodified] = [createRandomRecordFamily(), createRandomRecordFamily(), createRecordFamily(), createRecordFamily()];

      preferred.subrecords[1].fields = preferred.subrecords[1].fields.filter(f => f.tag !== '001');

      commitMerge(clientStub, preferred, other, merged, unmodified)
        .then(expectFulfillmentToNotBeCalled(done))
        .catch(expectErrorMessage('Id not found for 2. subrecord from preferred record.', done));

    });

    it('returns metadata of successful operation', (done) => {
      const expectedRecordId = 15;

      clientStub.update.resolves('UPDATE-OK');
      clientStub.create.resolves(createSuccessResponse(expectedRecordId));

      const [preferred, other, merged, unmodified] = [createRandomRecordFamily(), createRandomRecordFamily(), createRecordFamily(), createRecordFamily()];

      commitMerge(clientStub, preferred, other, merged, unmodified)
        .then(res => {
          expect(res).not.to.be.undefined;
          expect(res[0].recordId).to.equal(expectedRecordId);
          done();
        })
        .catch(done);

    });
  });
});

function expectFulfillmentToNotBeCalled(done) {
  return () => done(new Error('Fulfillment handler was called unexpectedly.'));
}

function expectErrorMessage(msg, done) {
  return function (err) {
    try {
      expect(err.message).to.equal(msg);
      done();
    } catch (e) {
      done(e);
    }
  };
}

function createRecordFamily() {
  return {
    record: createRecord(),
    subrecords: [createRecord()]
  };
}

function createRecord() {
  return MarcRecord.fromString('001    ""');
}

function createRandomRecordFamily() {
  return {
    record: createRandomRecord(),
    subrecords: [createRandomRecord(), createRandomRecord(), createRandomRecord()]
  };
}

function createRandomRecord() {
  return MarcRecord.fromString(`001    ${Math.floor(Math.random() * 1000000)}`);
}

function createSuccessResponse(recordId) {
  return {
    messages: [{code: '0018', message: `Document: ${recordId} was updated successfully.`}],
    errors: [],
    triggers: [
      {code: '0101', message: 'Field SID with text "$$c757724$$boula" is a duplicate entry in the INDEX file.'},
      {code: '0101', message: 'Field SID with text "$$c757724$$boula" is a duplicate entry in the INDEX file.'}
    ],
    warnings: [
      {code: '0121', message: 'Document is duplicate in the database (Matched against System No. 003342333 by LOCATE command).'},
      {code: '0121', message: 'Document is duplicate in the database (Matched against System No. 000698067 by LOCATE command).'}
    ],
    recordId: recordId
  };
}