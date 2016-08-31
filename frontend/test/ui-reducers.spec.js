import {expect} from 'chai';
import {loadSourceRecord, loadTargetRecord, setSourceRecord, setTargetRecord, setTargetRecordError, setSourceRecordError} from '../js/ui-reducers';
import { INITIAL_STATE } from '../js/root-reducer';
import MarcRecord from 'marc-record-js';

describe('ui reducers', () => {

  const testRecordObject = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '00384794' },
      { tag: '003', value: 'FI-MELINDA' },
      { tag: '008', value: 'SOURCE' }
    ]
  });

  const otherTestRecordObject = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '00384794' },
      { tag: '003', value: 'FI-MELINDA' },
      { tag: '005', value: 'FIELD-005' },
      { tag: '008', value: 'TARGET' },
      { tag: '009', value: 'TARGET' }
    ]
  }); 

  describe('loadSourceRecord', () => {
    it('sets the state to LOADING', () => {

      const state = INITIAL_STATE;
      let nextState = loadSourceRecord(state, '00384794');

      expect(nextState).to.equal(state.mergeDeep({
        sourceRecord: {
          id: '00384794',
          state: 'LOADING'
        }
      }));
    });
  });

  describe('loadTargetRecord', () => {
    it('sets the state to LOADING', () => {

      const state = INITIAL_STATE;
      let nextState = loadTargetRecord(state, '00384794');

      expect(nextState).to.equal(state.mergeDeep({
        targetRecord: {
          id: '00384794',
          state: 'LOADING'
        }
      }));
    });
  });

  describe('setSourceRecord', () => {

    it('sets the source record', () => {
      let nextState = setSourceRecord(INITIAL_STATE, testRecordObject);
      expect(nextState.toJS()).to.eql(INITIAL_STATE.setIn(['sourceRecord'], {
        state: 'LOADED',
        record: testRecordObject
      }).toJS());
    });
  });

  describe('setTargetRecord', () => {

    it('sets the target record', () => {
      let nextState = setTargetRecord(INITIAL_STATE, testRecordObject);
      
      expect(nextState.toJS()).to.eql(INITIAL_STATE.setIn(['targetRecord'], {
        state: 'LOADED',
        record: testRecordObject
      }).toJS());
    });
  });

  describe('setTargetRecordError', () => {

    it('sets the record state to ERROR and errorMessage', () => {
      let nextState = setTargetRecordError(INITIAL_STATE, 'error-message');
      
      expect(nextState.toJS()).to.eql(INITIAL_STATE.setIn(['targetRecord'], {
        state: 'ERROR',
        errorMessage: 'error-message'
      }).toJS());
    });
  });

  describe('setSourceRecordError', () => {

    it('sets the record state to ERROR and errorMessage', () => {
      let nextState = setSourceRecordError(INITIAL_STATE, 'error-message');
      
      expect(nextState.toJS()).to.eql(INITIAL_STATE.setIn(['sourceRecord'], {
        state: 'ERROR',
        errorMessage: 'error-message'
      }).toJS());
    });
  });

  describe('merged record', () => {

    it('has state=EMPTY initially', () => {
      expect(INITIAL_STATE.toJS().mergedRecord).to.eql({
        'state': 'EMPTY'
      });
    });

    it('is calculated from source and target records', () => {

      let nextState = setSourceRecord(INITIAL_STATE, testRecordObject);
      const finalState = setTargetRecord(nextState, otherTestRecordObject);

      expect(finalState.toJS().mergedRecord.state).to.eql('LOADED');

      expect(finalState.toJS().mergedRecord.record.toJsonObject()).to.eql(
        {
          'leader': '^^^^^cam^a22002897i^4500',
          'fields': [
            {
              'tag': '001',
              'value': '00384794',
              'fromPreferred': true,
              'wasUsed': true
            },
            {
              'tag': '003',
              'value': 'FI-MELINDA',
              'fromPreferred': true,
              'wasUsed': true
            },
            {
              'tag': '008',
              'value': 'SOURCE',
              'fromPreferred': true,
              'wasUsed': true
            },
            {
              'tag': '009',
              'value': 'TARGET',
              'fromOther': true,
              'wasUsed': true
            }
          ]
        }
      );
    });

    it('is has state=EMPTY if target record is not ready', () => {

      let nextState = setSourceRecord(INITIAL_STATE, testRecordObject);
      nextState = setTargetRecord(nextState, otherTestRecordObject);
      const finalState = loadTargetRecord(nextState, '00384794');
      
      expect(finalState.toJS().mergedRecord).to.eql({
        'state': 'EMPTY'
      });
    });

    it('is has state=EMPTY if source record is not ready', () => {

      let nextState = setSourceRecord(INITIAL_STATE, testRecordObject);
      nextState = setTargetRecord(nextState, otherTestRecordObject);
      const finalState = loadSourceRecord(nextState, '00384794');

      expect(finalState.toJS().mergedRecord).to.eql({
        'state': 'EMPTY'
      });

    });

  });
});
