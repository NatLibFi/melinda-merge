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
import request from 'supertest';
import httpStatus from 'http-status';
import {__RewireAPI__ as RewireAPI} from '../merge-controller';
import {mergeController} from '../merge-controller';
import {createSessionToken} from 'server/session-crypt';
import {MarcRecord} from '@natlibfi/marc-record';

MarcRecord.setValidationOptions({fields: false, subfields: false, subfieldValues: false});
chai.use(sinonChai);

const sessionToken = createSessionToken('test-user', 'test-pass');

describe('MARC IO controller', () => {
  describe('commit-merge', () => {
    let commitMergeStub;
    let createArchiveStub;
    let getRecordStub;
    let loggerStub;

    beforeEach(() => {
      loggerStub = {log: sinon.stub()};
      getRecordStub = sinon.stub();
      commitMergeStub = sinon.stub();
      const createApiClientStub = sinon.stub().returns({
        getRecord: getRecordStub
      });
      createArchiveStub = sinon.stub().resolves({
        filename: 'FAKE-FILENAME',
        size: 'FAKE-SIZE'
      });
      RewireAPI.__Rewire__('commitMerge', commitMergeStub);
      RewireAPI.__Rewire__('createArchive', createArchiveStub);
      RewireAPI.__Rewire__('createApiClient', createApiClientStub);
      RewireAPI.__Rewire__('logger', loggerStub);
    });
    afterEach(() => {
      RewireAPI.__ResetDependency__('commitMerge');
      RewireAPI.__ResetDependency__('createArchive');
      RewireAPI.__ResetDependency__('newClient');
      RewireAPI.__ResetDependency__('logger');
    });

    it('returns UNAUTHORIZED if credentials are missing', (done) => {
      request(mergeController)
        .post('/commit-merge')
        .expect(httpStatus.UNAUTHORIZED, done);
    });

    it('returns BAD_REQUEST if records are missing', (done) => {
      commitMergeStub.rejects('Error');

      request(mergeController)
        .post('/commit-merge')
        .set('Cookie', `sessionToken=${sessionToken}`)
        .expect(httpStatus.BAD_REQUEST, done);
    });

    it('returns 200 if commit is successful', (done) => {
      commitMergeStub.resolves('Ok');
      const {record, subrecords} = createFakeRecordFamily('123');
      getRecordStub.resolves({record, subrecords});

      request(mergeController)
        .post('/commit-merge')
        .set('Cookie', `sessionToken=${sessionToken}`)
        .send({
          'otherRecord': createFakeRecordFamily(),
          'preferredRecord': createFakeRecordFamily(),
          'mergedRecord': createFakeRecordFamily(),
          'unmodifiedRecord': createFakeRecordFamily()
        })
        .expect(httpStatus.OK, done);
    });

    it('returns error from server if commit-merge fails', (done) => {
      commitMergeStub.rejects('Error from backend server');

      request(mergeController)
        .post('/commit-merge')
        .set('Cookie', `sessionToken=${sessionToken}`)
        .send({
          'otherRecord': createFakeRecordFamily(),
          'preferredRecord': createFakeRecordFamily(),
          'mergedRecord': createFakeRecordFamily(),
          'unmodifiedRecord': createFakeRecordFamily()
        })
        .expect(httpStatus.INTERNAL_SERVER_ERROR, done);
    });
  });
});

function createFakeRecord(value = '""') {
  return MarcRecord.fromString(`001    ${value}`);
}

function createFakeRecordFamily(value = '""') {
  return {
    record: createFakeRecord(value),
    subrecords: []
  };
}
