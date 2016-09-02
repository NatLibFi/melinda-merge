import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import * as actions from '../js/ui-actions';
import { __RewireAPI__ as ActionsRewireAPI } from '../js/ui-actions';
import Immutable from 'immutable';

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

      it('throws if type paremeter is not set', () => {
        const fetchRecordThunk = fetchRecord(30000);
        expect(fetchRecordThunk).to.throw(Error);
      });

      function createResponsePromise(status, result) {
        return fn => {

          const response = {
            status: status,
            json: () => {
              return {
                then: (fn) => fn(result)
              };
            }
          };

          fn(response);
          return {
            catch: sinon.stub()
          };
       
        };
      }

      it('should dispatch loadSourceRecord and setSourceRecord actions', () => {

        const result = {
          leader: 'test-leader', 
          fields: []
        };
    
        ActionsRewireAPI.__Rewire__('fetch', function() {
          return {
            then: createResponsePromise(200, result)
          };
        });

        const fetchRecordThunk = fetchRecord(30000, 'SOURCE');

        const dispatchSpy = sinon.spy();

        fetchRecordThunk(dispatchSpy);

        expect(dispatchSpy).to.have.been.calledWith(actions.loadSourceRecord(30000));
        expect(dispatchSpy).to.have.been.calledWith(actions.setSourceRecord(sinon.match.object));
        
      });


      it('should dispatch setSourceRecordError on 404', () => {

        const result = {
          leader: 'test-leader', 
          fields: []
        };
    
        ActionsRewireAPI.__Rewire__('fetch', function() {
          return {
            then: createResponsePromise(404, result)
          };
        });

        const fetchRecordThunk = fetchRecord(30000, 'SOURCE');

        const dispatchSpy = sinon.spy();

        fetchRecordThunk(dispatchSpy);

        expect(dispatchSpy).to.have.been.calledWith(actions.setSourceRecordError(sinon.match.string));
        
      });


      it('should dispatch setSourceRecordError on network error', () => {

        ActionsRewireAPI.__Rewire__('fetch', function() {
          return {
            then: () => {
              return {
                catch: fn => fn('fetch promise was rejected')  
              };
            }
          };
        });

        const fetchRecordThunk = fetchRecord(30000, 'SOURCE');

        const dispatchSpy = sinon.spy();

        fetchRecordThunk(dispatchSpy);

        expect(dispatchSpy).to.have.been.calledWith(actions.setSourceRecordError(sinon.match.string));
        
      });
    });
  });
});
