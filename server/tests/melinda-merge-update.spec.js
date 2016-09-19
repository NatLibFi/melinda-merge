import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinonAsPromised from 'sinon-as-promised'; // eslint-disable-line
chai.use(sinonChai);
const expect = chai.expect;
import { commitMerge } from '../melinda-merge-update';

import MarcRecord from 'marc-record-js';

describe('melinda merge update', function() {
  describe('commitMerge', function() {

    it('requires that preferred and other records have id', function(done) {

      const clientStub = sinon.stub();
      const [preferred, other, merged] = [createRecord(), createRecord(), createRecord()];

      commitMerge(clientStub, preferred, other, merged)
        .then(expectFulfillmentToNotBeCalled(done))
        .catch(err => {
          try {
            expect(err.message).to.equal('Could not find id from preferred record');
            done();
          } catch(e) {
            done(e);
          }
        });

    });

    it('returns metadata of successful operation', function(done) {
      const expectedRecordId = 15;

      const clientStub = createClientStub();
      clientStub.updateRecord.resolves('OK');
      clientStub.createRecord.resolves(createSuccessResponse(expectedRecordId));

      const [preferred, other, merged] = [createRecord(), createRecord(), createRecord()];
      preferred.appendControlField(['001', '1']);
      other.appendControlField(['001', '2']);

      commitMerge(clientStub, preferred, other, merged)
        .then(res => {
          expect(res).not.to.be.undefined;
          expect(res.recordId).to.equal(expectedRecordId);
          done();
        })
        .catch(done);

    });

  });
});

function createClientStub() {
  return {
    updateRecord: sinon.stub(),
    createRecord: sinon.stub()
  };
}

function expectFulfillmentToNotBeCalled(done) {
  return () => done(new Error('Fulfillment handler was called unexpectedly.'));
}

function createRecord() {
  return new MarcRecord();
}


function createSuccessResponse(recordId) {
  return { 
    messages: [ { code: '0018', message: `Document: ${recordId} was updated successfully.` } ],
    errors: [],
    triggers: [ 
      { code: '0101', message: 'Field SID with text "$$c757724$$boula" is a duplicate entry in the INDEX file.' },
      { code: '0101', message: 'Field SID with text "$$c757724$$boula" is a duplicate entry in the INDEX file.' } 
    ],
    warnings: [ 
      { code: '0121', message: 'Document is duplicate in the database (Matched against System No. 003342333 by LOCATE command).' },
      { code: '0121', message: 'Document is duplicate in the database (Matched against System No. 000698067 by LOCATE command).' } 
    ],
    recordId: recordId
  };
}