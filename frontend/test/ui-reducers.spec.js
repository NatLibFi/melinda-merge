import {expect} from 'chai';
import * as actions from '../js/ui-actions';

import { INITIAL_STATE } from '../js/root-reducer';
import reducer from '../js/root-reducer';
import MarcRecord from 'marc-record-js';

describe('ui reducers', () => {

  const testRecordObject = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '00384794' },
      { tag: '003', value: 'FI-MELINDA' },
      { tag: '008', value: 'SOURCE' },
      { tag: '222', subfields: [{
        code: 'a',
        value: 'The field'
      }]}

    ]
  });

  const otherTestRecordObject = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '00384794' },
      { tag: '003', value: 'FI-MELINDA' },
      { tag: '005', value: 'FIELD-005' },
      { tag: '008', value: 'TARGET' },
      { tag: '009', value: 'TARGET' },
    
    ]
  });

  const ssub1 = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '0000000011' },
      { tag: '008', value: 'SOURCE' },
      { tag: '003', value: 'ssub1' }
    ]
  });

  describe('loadSourceRecord', () => {
    it('sets the state to LOADING', () => {

      const state = INITIAL_STATE;
      
      let nextState = reducer(state, actions.loadSourceRecord('00384794'));

      expect(nextState.get('sourceRecord').toJS()).to.eql({
        id: '00384794',
        state: 'LOADING'
      });
    
      expect(nextState.get('mergeStatus').toJS()).to.eql({
        status: 'COMMIT_MERGE_DISABLED'
      });
    
    });
  });

  describe('loadTargetRecord', () => {
    it('sets the state to LOADING', () => {

      const state = INITIAL_STATE;
      let nextState = reducer(state, actions.loadTargetRecord('00384794'));

      expect(nextState.get('targetRecord').toJS()).to.eql({
        id: '00384794',
        state: 'LOADING'
      });
    
      expect(nextState.get('mergeStatus').toJS()).to.eql({
        status: 'COMMIT_MERGE_DISABLED'
      });
      
    });
  });

  describe('setSourceRecord', () => {

    it('sets the source record', () => {
      let nextState = reducer(INITIAL_STATE, actions.setSourceRecord(testRecordObject, []));


      expect(nextState.get('sourceRecord').toJS()).to.eql({
        state: 'LOADED',
        record: testRecordObject
      });
    
      expect(nextState.get('mergeStatus').toJS()).to.eql({
        status: 'COMMIT_MERGE_DISABLED'
      });

    });

    it('sets the source record and subrecords', () => {

      let nextState = reducer(INITIAL_STATE, actions.setSourceRecord(testRecordObject, [ssub1]));

      expect(nextState.get('sourceRecord').toJS()).to.eql({
        state: 'LOADED',
        record: testRecordObject
      });
    
      expect(nextState.get('mergeStatus').toJS()).to.eql({
        status: 'COMMIT_MERGE_DISABLED'
      });

      const sourceSubrecords = nextState.getIn(['subrecords', 'sourceRecord']).toJS();
      expect(sourceSubrecords).to.eql([ssub1]);

    });

  
    it('initialized subrecords to empty correctly', () => {
      let nextState = reducer(INITIAL_STATE, actions.setSourceRecord(testRecordObject));
      const sourceSubrecords = nextState.getIn(['subrecords', 'sourceRecord']).toJS();
      expect(sourceSubrecords).to.eql([]);

    });
  });

  describe('setTargetRecord', () => {

    it('sets the target record', () => {

      let nextState = reducer(INITIAL_STATE, actions.setTargetRecord(testRecordObject, []));

      expect(nextState.get('targetRecord').toJS()).to.eql({
        state: 'LOADED',
        record: testRecordObject
      });
    
      expect(nextState.get('mergeStatus').toJS()).to.eql({
        status: 'COMMIT_MERGE_DISABLED'
      });

    });
  });

  describe('setTargetRecordError', () => {

    it('sets the record state to ERROR and errorMessage', () => {

      let nextState = reducer(INITIAL_STATE, actions.setTargetRecordError('error-message'));

      expect(nextState.get('targetRecord').toJS()).to.eql({
        state: 'ERROR',
        errorMessage: 'error-message'
      });

    });
  });

  describe('setSourceRecordError', () => {

    it('sets the record state to ERROR and errorMessage', () => {

      let nextState = reducer(INITIAL_STATE, actions.setSourceRecordError('error-message'));

      expect(nextState.get('sourceRecord').toJS()).to.eql({
        state: 'ERROR',
        errorMessage: 'error-message'
      });

    });
  });

  describe('merged record', () => {
    let state;
    beforeEach(() => {
      state = reducer(state, actions.setSourceRecord(testRecordObject));
      state = reducer(state, actions.setTargetRecord(otherTestRecordObject));

    });

    it('has state=EMPTY initially', () => {
      expect(state.toJS().mergedRecord).to.eql({
        'state': 'EMPTY'
      });
    });

    it('is has state=EMPTY if target record is not ready', () => {

      const finalState = reducer(state, actions.loadTargetRecord('00384794'));
      
      expect(finalState.toJS().mergedRecord).to.eql({
        'state': 'EMPTY'
      });
    });

    it('is has state=EMPTY if source record is not ready', () => {

      const finalState = reducer(state, actions.loadSourceRecord('00384794'));

      expect(finalState.toJS().mergedRecord).to.eql({
        'state': 'EMPTY'
      });

    });

  });

});
