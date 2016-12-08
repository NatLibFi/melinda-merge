import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinonAsPromised from 'sinon-as-promised'; // eslint-disable-line
import request from 'supertest';
import HttpStatus from 'http-status-codes';
import { __RewireAPI__ as RewireAPI } from '../merge-controller';
import { mergeController } from '../merge-controller';
import { createSessionToken } from 'server/session-crypt';

chai.use(sinonChai);

const sessionToken = createSessionToken('test-user', 'test-pass');

describe('MARC IO controller', () => {

  describe('commit-merge', () => {

    let commitMergeStub;
    let createArchiveStub;
    let loadRecordStub;

    beforeEach(() => {
      commitMergeStub = sinon.stub();
      loadRecordStub = sinon.stub();
      createArchiveStub = sinon.stub().resolves({
        filename: 'FAKE-FILENAME',
        size: 'FAKE-SIZE'
      });
      RewireAPI.__Rewire__('commitMerge', commitMergeStub);
      RewireAPI.__Rewire__('createArchive', createArchiveStub);
      RewireAPI.__Rewire__('loadRecord', loadRecordStub);
     
    });
    afterEach(() => {
      RewireAPI.__ResetDependency__('commitMerge');
      RewireAPI.__ResetDependency__('createArchive');
      RewireAPI.__ResetDependency__('loadRecord');
    });

    it('returns UNAUTHORIZED if credentials are missing', (done) => {

      request(mergeController)
        .post('/commit-merge')
        .expect(HttpStatus.UNAUTHORIZED, done);
        
    });

    it('returns BAD_REQUEST if records are missing', (done) => {

      commitMergeStub.rejects('Error');

      request(mergeController)
        .post('/commit-merge')
        .set('Cookie', `sessionToken=${sessionToken}`)
        .expect(HttpStatus.BAD_REQUEST, done);

    });

    it('returns 200 if commit is successful', (done) => {

      commitMergeStub.resolves('Ok');
      const { record, subrecords } = createFakeRecordFamily();
      record.fields.push({'tag': '001', 'value': '123'});
      loadRecordStub.resolves({record, subrecords});

      request(mergeController)
        .post('/commit-merge')
        .set('Cookie', `sessionToken=${sessionToken}`)
        .send({
          'otherRecord': createFakeRecordFamily(), 
          'preferredRecord': createFakeRecordFamily(), 
          'mergedRecord': createFakeRecordFamily(),
          'unmodifiedRecord': createFakeRecordFamily()
        })
        .expect(HttpStatus.OK, done);
        
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
        .expect(HttpStatus.INTERNAL_SERVER_ERROR, done);
        
    });
  });

});

function createFakeRecord() {
  return {
    fields: []
  };
}

function createFakeRecordFamily() {
  return {
    record: createFakeRecord(),
    subrecords: []
  };
}
