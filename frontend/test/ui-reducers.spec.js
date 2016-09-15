import {expect} from 'chai';
import {loadSourceRecord, loadTargetRecord, setSourceRecord, setTargetRecord, 
  setTargetRecordError, setSourceRecordError, insertSubrecordRow, removeSubrecordRow, changeSourceSubrecordRow, setSubrecordAction} from '../js/ui-reducers';
import { INITIAL_STATE } from '../js/root-reducer';
import MarcRecord from 'marc-record-js';
import { SubrecordActionTypes } from '../js/constants';
import { List } from 'immutable';

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

  const tsub1 = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '0000000001' },
      { tag: '008', value: 'TARGET' },
    ]
  });

  const tsub2 = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '0000000002' },
      { tag: '008', value: 'TARGET' },
    ]
  });

  const tsub3 = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '0000000003' },
      { tag: '008', value: 'TARGET' },
    ]
  });

  const ssub1 = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '0000000011' },
      { tag: '008', value: 'SOURCE' },
    ]
  });

  const ssub2 = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '0000000012' },
      { tag: '008', value: 'SOURCE' },
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
      let nextState = setSourceRecord(INITIAL_STATE, testRecordObject, []);
      expect(nextState.toJS()).to.eql(INITIAL_STATE.setIn(['sourceRecord'], {
        state: 'LOADED',
        record: testRecordObject,
        subrecords: []
      }).toJS());

      const sourceSubrecords = nextState.getIn(['sourceRecord', 'subrecords']).toJS();
      expect(sourceSubrecords).to.eql([]);

    });

    it('sets the source record and subrecords', () => {
      let nextState = setSourceRecord(INITIAL_STATE, testRecordObject, [ssub1]);

      expect(nextState.toJS().sourceRecord.record).to.eql(testRecordObject);

      const sourceSubrecords = nextState.getIn(['sourceRecord', 'subrecords']).toJS();
      expect(sourceSubrecords).to.eql([ssub1]);

    });

  
    it('initialized subrecords to empty correctly', () => {
      let nextState = setSourceRecord(INITIAL_STATE, testRecordObject);
      const sourceSubrecords = nextState.getIn(['sourceRecord', 'subrecords']).toJS();
      expect(sourceSubrecords).to.eql([]);

    });
  });

  describe('setTargetRecord', () => {

    it('sets the target record', () => {
      let nextState = setTargetRecord(INITIAL_STATE, testRecordObject, []);
      
      expect(nextState.toJS()).to.eql(INITIAL_STATE.setIn(['targetRecord'], {
        state: 'LOADED',
        record: testRecordObject,
        subrecords: []
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

  describe('subrecords', function() {

    function subrecords(state) {
      const sourceSubrecords = state.getIn(['sourceRecord', 'subrecords']).toJS();
      const targetSubrecords = state.getIn(['targetRecord', 'subrecords']).toJS();
      return {sourceSubrecords, targetSubrecords};
    }

    describe('insert row with equal amount of subrecords', function() {

      let state;
      beforeEach(() => {
        state = setSourceRecord(INITIAL_STATE, testRecordObject, [ssub1, ssub2]);
        state = setTargetRecord(state, otherTestRecordObject, [tsub1, tsub2]);
      });

      it('inserts empty row in the beginning of subrecords when rowIndex is 0', () => {
        state = insertSubrecordRow(state, 0);
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([undefined, ssub1, ssub2]);
        expect(targetSubrecords).to.eql([undefined, tsub1, tsub2]);
      });

      it('inserts empty row in between of subrecords', () => {
        state = insertSubrecordRow(state, 1);
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined, ssub2]);
        expect(targetSubrecords).to.eql([tsub1, undefined, tsub2]);
      });
      
      it('inserts empty row after subrecords', () => {
        state = insertSubrecordRow(state, 2);
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, ssub2, undefined]);
        expect(targetSubrecords).to.eql([tsub1, tsub2, undefined]);
      });
      
    });


    describe('insert row with unequal amount of records', function() {

      let state;
      beforeEach(() => {
        state = setSourceRecord(INITIAL_STATE, testRecordObject, [ssub1]);
        state = setTargetRecord(state, otherTestRecordObject, [tsub1, tsub2, tsub3]);
      });

      it('inserts empty row in the beginning of subrecords when rowIndex is 0', () => {
        state = insertSubrecordRow(state, 0);
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([undefined, ssub1]);
        expect(targetSubrecords).to.eql([undefined, tsub1, tsub2, tsub3]);
      });

      it('inserts empty row in between of subrecords', () => {
        state = insertSubrecordRow(state, 1);
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined]);
        expect(targetSubrecords).to.eql([tsub1, undefined, tsub2, tsub3]);
      });
      
      it('inserts empty row only between subrecords of longer list', () => {
        state = insertSubrecordRow(state, 2);
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1]);
        expect(targetSubrecords).to.eql([tsub1, tsub2, undefined, tsub3]);
      });
      
      it('inserts empty row only after subrecords of longer list', () => {
        state = insertSubrecordRow(state, 3);
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1]);
        expect(targetSubrecords).to.eql([tsub1, tsub2, tsub3, undefined]);
      });

    });


    describe('remove row', function() {

      let state;
      beforeEach(() => {
        state = setSourceRecord(INITIAL_STATE, testRecordObject, [undefined, ssub1, undefined, ssub2, undefined]);
        state = setTargetRecord(state, otherTestRecordObject, [undefined, tsub1, undefined, tsub2, undefined]);
      });
    
      it('removes empty row in the beginning of subrecords when rowIndex is 0', () => {
        state = removeSubrecordRow(state, 0);
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined, ssub2, undefined]);
        expect(targetSubrecords).to.eql([tsub1, undefined, tsub2, undefined]);
      });

      it('removes empty row in between of subrecords', () => {
        state = removeSubrecordRow(state, 2);
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([undefined, ssub1, ssub2, undefined]);
        expect(targetSubrecords).to.eql([undefined, tsub1, tsub2, undefined]);
      });
      
      it('removes empty row after subrecords', () => {
        state = removeSubrecordRow(state, 4);
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([undefined, ssub1, undefined, ssub2]);
        expect(targetSubrecords).to.eql([undefined, tsub1, undefined, tsub2]);
      });

      it('does not remove non-empty row', () => {
        state = removeSubrecordRow(state, 1);
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([undefined, ssub1, undefined, ssub2, undefined]);
        expect(targetSubrecords).to.eql([undefined, tsub1, undefined, tsub2, undefined]);
      });
      
    });

    describe('change row', function() {
      let state;
      beforeEach(() => {
        state = setSourceRecord(INITIAL_STATE, testRecordObject, [undefined, ssub1, ssub2]);
        state = setTargetRecord(state, otherTestRecordObject, [tsub1, undefined, tsub2]);
      });

      it('moves source subrecord at 1 to 0', () => {

        state = changeSourceSubrecordRow(state, 1, 0);
        const { sourceSubrecords } = subrecords(state);
        expect(sourceSubrecords).to.eql([ssub1, undefined, ssub2]);

      });

      it('moves source subrecord at 2 to 0', () => {

        state = changeSourceSubrecordRow(state, 2, 0);
        const { sourceSubrecords } = subrecords(state);
        expect(sourceSubrecords).to.eql([ssub2, ssub1, undefined]);

      });

      it('does nothing if trying to move subrecord to non-undefined index', () => {

        state = changeSourceSubrecordRow(state, 2, 1);
        const { sourceSubrecords } = subrecords(state);
        expect(sourceSubrecords).to.eql([undefined, ssub1, ssub2]);

      });

      it('does nothing if trying to move undefined index', () => {

        state = changeSourceSubrecordRow(state, 0, 1);
        const { sourceSubrecords } = subrecords(state);
        expect(sourceSubrecords).to.eql([undefined, ssub1, ssub2]);

      });

    });

    describe('set subrecord action', function() {
      let state;
      beforeEach(() => {
        state = setSourceRecord(INITIAL_STATE, testRecordObject, [ssub1, ssub2]);
        state = setTargetRecord(state, otherTestRecordObject, [tsub1, tsub2]);
      });

      it('sets the action', () => {
        state = setSubrecordAction(state, 0, SubrecordActionTypes.MERGE);
        const selectedActions = state.get('subrecordActions').toJS();
        expect(selectedActions).to.eql([SubrecordActionTypes.MERGE]);
      });

      it('sets the action to correct position', () => {
        state = setSubrecordAction(state, 1, SubrecordActionTypes.MERGE);
        const selectedActions = state.get('subrecordActions').toJS();
        expect(selectedActions).to.eql([undefined, SubrecordActionTypes.MERGE]);
      });

    });

  });
});
