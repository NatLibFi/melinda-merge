import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinonAsPromised from 'sinon-as-promised'; // eslint-disable-line
import request from 'supertest';
import HttpStatus from 'http-status-codes';
import { __RewireAPI__ as MarcIOControllerRewireAPI } from '../marc-io-controller';
import { marcIOController } from '../marc-io-controller';
import { createSessionToken } from '../session-crypt';

chai.use(sinonChai);

const sessionToken = createSessionToken('test-user', 'test-pass');

describe('MARC IO controller', () => {

  describe('commit-merge', () => {

    let commitMergeStub;

    beforeEach(() => {
      commitMergeStub = sinon.stub();
      MarcIOControllerRewireAPI.__Rewire__('commitMerge', commitMergeStub);
     
    });
    afterEach(() => {
      MarcIOControllerRewireAPI.__ResetDependency__('commitMerge');
    });

    it('returns UNAUTHORIZED if credentials are missing', (done) => {

      request(marcIOController)
        .post('/commit-merge')
        .expect(HttpStatus.UNAUTHORIZED, done);
        
    });

    it('returns BAD_REQUEST if records are missing', (done) => {

      commitMergeStub.rejects('Error');

      request(marcIOController)
        .post('/commit-merge')
        .set('Cookie', `sessionToken=${sessionToken}`)
        .expect(HttpStatus.BAD_REQUEST, done);

    });

    it('returns 200 if commit is successful', (done) => {

      commitMergeStub.resolves('Ok');

      request(marcIOController)
        .post('/commit-merge')
        .set('Cookie', `sessionToken=${sessionToken}`)
        .send({
          'otherRecord': createFakeRecordFamily(), 
          'preferredRecord': createFakeRecordFamily(), 
          'mergedRecord': createFakeRecordFamily()
        })
        .expect(HttpStatus.OK, done);
        
    });

    it('returns error from server if commit-merge fails', (done) => {

      commitMergeStub.rejects('Error from backend server');

      request(marcIOController)
        .post('/commit-merge')
        .set('Cookie', `sessionToken=${sessionToken}`)
        .send({
          'otherRecord': createFakeRecordFamily(), 
          'preferredRecord': createFakeRecordFamily(), 
          'mergedRecord': createFakeRecordFamily()
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
