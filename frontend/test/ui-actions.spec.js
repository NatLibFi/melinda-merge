import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import * as actions from '../js/ui-actions';
import { __RewireAPI__ as ActionsRewireAPI } from '../js/ui-actions';
import Immutable from 'immutable';
require('sinon-as-promised');

chai.use(sinonChai);
const expect = chai.expect;

const fetchRecord = actions.fetchRecord;

describe('ui actions', () => {

  describe('swapRecords', () => {
    const swapRecords = actions.swapRecords;
    let fetchRecordStub;

    beforeEach(() => {
      fetchRecordStub = sinon.stub();
      ActionsRewireAPI.__Rewire__('fetchRecord', fetchRecordStub);
    });
    afterEach(() => {
      fetchRecordStub = sinon.stub();
      ActionsRewireAPI.__ResetDependency__('fetchRecord');
    });

    it('dispatch loadrecord actions with source->target and target->source', () => {

      const swapRecordsThunk = swapRecords();

      const dispatchSpy = sinon.spy();
      const getStateStub = sinon.stub().returns(Immutable.fromJS({
        sourceRecord: { id: 100 },
        targetRecord: { id: 200 }
      }));

      swapRecordsThunk(dispatchSpy, getStateStub);

      expect(fetchRecordStub).to.have.been.calledWith(100, 'TARGET');
      expect(fetchRecordStub).to.have.been.calledWith(200, 'SOURCE');
      
    });

  });

  describe('fetchRecord', () => {

    it('returns a thunk', () => {

      const fetchRecordThunk = fetchRecord(30000, 'SOURCE');

      expect(fetchRecordThunk).to.be.a('function');
    });

    describe('thunk', () => {
      let fetchStub;
      beforeEach(() => {
        fetchStub = sinon.stub();
        ActionsRewireAPI.__Rewire__('fetch', fetchStub);
      });
      afterEach(() => {
        ActionsRewireAPI.__ResetDependency__('fetch');
      });

      it('throws if type paremeter is not set', () => {
        const fetchRecordThunk = fetchRecord(30000);
        expect(fetchRecordThunk).to.throw(Error);
      });

      it('should dispatch loadSourceRecord and setSourceRecord actions', (done) => {

        const result = {
          record: {
            leader: 'test-leader', 
            fields: []
          },
          subrecords: []
        };

        fetchStub.resolves({
          status: 200,
          json: sinon.stub().resolves(result)
        });
    
        const fetchRecordThunk = fetchRecord(30000, 'SOURCE');

        const dispatchSpy = sinon.spy();

        fetchRecordThunk(dispatchSpy).then(() => {
          expect(dispatchSpy).to.have.been.calledWith(actions.loadSourceRecord(sinon.match.number));
          expect(dispatchSpy).to.have.been.calledWith(actions.setSourceRecord(sinon.match.object, sinon.match.array, sinon.match.number));
          done();
        }).catch(done);
        
      });

      it('should dispatch setSourceRecordError on 404', () => {

        const result = {
          leader: 'test-leader', 
          fields: []
        };
    
        fetchStub.resolves({
          status: 404,
          json: sinon.stub().resolves(result)
        });

        const fetchRecordThunk = fetchRecord(30000, 'SOURCE');

        const dispatchSpy = sinon.spy();

        fetchRecordThunk(dispatchSpy).then(() => {
          expect(dispatchSpy).to.have.been.calledWith(actions.setSourceRecordError(sinon.match.string));
        });

      });

      it('should dispatch setSourceRecordError on network error', () => {

        fetchStub.rejects({
          message: 'error'
        });

        const fetchRecordThunk = fetchRecord(30000, 'SOURCE');

        const dispatchSpy = sinon.spy();

        fetchRecordThunk(dispatchSpy).then(() => {
          expect(dispatchSpy).to.have.been.calledWith(actions.setSourceRecordError(sinon.match.string));
        });
        
      });
    });
  });
});
