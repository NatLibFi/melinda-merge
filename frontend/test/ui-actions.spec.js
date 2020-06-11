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
import * as actions from '../js/ui-actions';
import {__RewireAPI__ as ActionsRewireAPI} from '../js/ui-actions';
import Immutable from 'immutable';

chai.use(sinonChai);
const expect = chai.expect;

const fetchRecord = actions.fetchRecord;

// For local testing
// const commitMerge = actions.commitMerge;

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
        sourceRecord: {id: 100},
        targetRecord: {id: 200}
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
          payload: 'error'
        });

        const fetchRecordThunk = fetchRecord(30000, 'SOURCE');

        const dispatchSpy = sinon.spy();

        fetchRecordThunk(dispatchSpy).then(() => {
          expect(dispatchSpy).to.have.been.calledWith(actions.setSourceRecordError(sinon.match.string));
        });

      });
    });
  });

  /* For local testing
  describe('commitMerge', () => {
    let fetchStub;
    let subrecordRowsStub;
    let dispatchSpy;
    let errorSpy;

    beforeEach(() => {
      fetchStub = sinon.stub();
      subrecordRowsStub = sinon.stub();
      ActionsRewireAPI.__Rewire__('fetch', fetchStub);
      ActionsRewireAPI.__Rewire__('subrecordRows', subrecordRowsStub);
    });
    afterEach(() => {
      ActionsRewireAPI.__ResetDependency__('fetch');
      ActionsRewireAPI.__ResetDependency__('subrecordRows');
    });

    it('returns a thunk', () => {
      const commitMergeThunk = commitMerge();

      expect(commitMergeThunk).to.be.a('function');
    });

    it('starts', () => {
      const dispatchSpy = sinon.spy();
      const errorSpy = sinon.spy();
      const getStateStub = sinon.stub().returns(Immutable.fromJS({
        sourceRecord: {record: MarcRecord.fromString(`LDR    00000_a____\n001    100`).toObject()},
        targetRecord: {record: MarcRecord.fromString(`LDR    00000_a____\n001    101`).toObject()},
        mergedRecord: {
          record: MarcRecord.fromString(`LDR    00000_a____\n001    000000000`).toObject(),
          unmodifiedRecord: MarcRecord.fromString(`LDR    00000_a____\n001    000000100`).toObject()
        }
      }));

      subrecordRowsStub.resolves([{
        isSwapped: false,
        mergeError: undefined,
        rowId: 'row61',
        saveStatus: 'UNSAVED',
        selectedAction: 'MERGE',
        sourceRecord: {record: MarcRecord.fromString(`LDR    00000_a____\n001    100`).toObject()},
        targetRecord: {record: MarcRecord.fromString(`LDR    00000_a____\n001    101`).toObject()},
        mergedRecord: {record: MarcRecord.fromString(`LDR    00000_a____\n001    000000000`).toObject()},
        unmodifiedMergedRecord: MarcRecord.fromString(`LDR    00000_a____\n001    000000100`).toObject()
      }]);

      fetchStub.resolves({
        status: 200,
        operation: 'CREATE',
        recordId: 30000,
        record: MarcRecord.fromString(`LDR    00000_a____\n001    100`),
        subrecords: []
      });
      const commitMergeThunk = commitMerge();

      const result = commitMergeThunk(dispatchSpy, getStateStub);
      const [call1] = dispatchSpy.getCall(0).args
      expect(call1.type, 'WRONG CALL!').to.equals('COMMIT_MERGE_START');
    });
  }); */
});
