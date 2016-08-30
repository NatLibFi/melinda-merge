import {expect} from 'chai';
import {Map, fromJS} from 'immutable';
import {loadSourceRecord, loadTargetRecord, setSourceRecord, setTargetRecord, setTargetRecordError, setSourceRecordError} from '../js/ui-reducers';
import { INITIAL_STATE } from '../js/root-reducer';

describe('ui reducers', () => {

  const testRecordObject = {
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '00384794' },
      { tag: '003', value: 'FI-MELINDA' }
    ]
  }; 

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

});
