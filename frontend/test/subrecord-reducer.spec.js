import {expect} from 'chai';
import {setSourceRecord, setTargetRecord} from '../js/ui-reducers';
import {insertSubrecordRow, removeSubrecordRow, changeSourceSubrecordRow, setMergedSubrecord, setSubrecordAction, changeSubrecordRow} from '../js/reducers/subrecord-reducer';
import MarcRecord from 'marc-record-js';
import { INITIAL_STATE } from '../js/root-reducer';
import { SubrecordActionTypes } from '../js/constants';
import * as actions from '../js/ui-actions';
import reducer from '../js/root-reducer';

describe('Subrecord reducer', () => {

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
      { tag: '003', value: 'tsub1' }
    ]
  });

  const tsub2 = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '0000000002' },
      { tag: '008', value: 'TARGET' },
      { tag: '003', value: 'tsub2' }
    ]
  });

  const tsub3 = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '0000000003' },
      { tag: '008', value: 'TARGET' },
      { tag: '003', value: 'tsub3' }
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

  const ssub2 = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '0000000012' },
      { tag: '008', value: 'SOURCE' },
      { tag: '003', value: 'ssub2' }
    ]
  });

  const msub1 = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '0000000022' },
      { tag: '008', value: 'MERGED' },
      { tag: '003', value: 'msub1' }
    ]
  });

  describe('subrecords', function() {

    function toName(record) {
      if (record === undefined) return record;
      return record.fields.filter(f => f.tag == '003')[0].value;
    }

    function subrecords(state) {
      const sourceSubrecords = state.getIn(['subrecords', 'sourceRecord']).toJS();
      const targetSubrecords = state.getIn(['subrecords', 'targetRecord']).toJS();
      const mergedSubrecords = state.getIn(['subrecords', 'mergedRecord']).toJS();
      const subrecordActions = state.getIn(['subrecords', 'actions']).toJS();
      return {sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions};
    }

    describe('set subrecord action', function() {
      let state;
      beforeEach(() => {
        state = reducer(INITIAL_STATE, actions.setSourceRecord(testRecordObject, [ssub1, ssub2]));
        state = reducer(state, actions.setTargetRecord(otherTestRecordObject, [tsub1, tsub2]));
      });

      it('sets the action', () => {
        state = reducer(state, actions.setSubrecordAction(0, SubrecordActionTypes.MERGE));
        const { subrecordActions } = subrecords(state);
        expect(subrecordActions).to.eql([SubrecordActionTypes.MERGE]);

      });

      it('sets the action to correct position', () => {
        state = reducer(state, actions.setSubrecordAction(1, SubrecordActionTypes.MERGE));
        const { subrecordActions } = subrecords(state);
        expect(subrecordActions).to.eql([undefined, SubrecordActionTypes.MERGE]);
      });

    });

    describe('set merged record\'s subrecords', () => {
      let state;
      beforeEach(() => {
        state = reducer(INITIAL_STATE, actions.setSourceRecord(testRecordObject, [ssub1, ssub2]));
        state = reducer(state, actions.setTargetRecord(otherTestRecordObject, [tsub1, tsub2]));
      });

      it('should set merged subrecord at position', () => {

        state = reducer(state, actions.setMergedSubrecord(1, msub1));
        const { mergedSubrecords } = subrecords(state); 
        expect(mergedSubrecords).to.eql([undefined, msub1]);

      });

      it('should set merged subrecord at beginning if position=0', () => {
        state = reducer(state, actions.setMergedSubrecord(0, msub1));
        const { mergedSubrecords } = subrecords(state); 
        expect(mergedSubrecords).to.eql([msub1]);

      });
       
    });

    describe('insert row with equal amount of subrecords', function() {

      let state;
      beforeEach(() => {
        state = undefined;
        state = reducer(state, actions.setSourceRecord(testRecordObject, [ssub1, ssub2]));
        state = reducer(state, actions.setTargetRecord(otherTestRecordObject, [tsub1, tsub2]));
        state = reducer(state, actions.setSubrecordAction(0, SubrecordActionTypes.BLOCK));
        state = reducer(state, actions.setSubrecordAction(1, SubrecordActionTypes.MERGE));
        state = reducer(state, actions.setMergedSubrecord(1, msub1));
      });

      it('inserts empty row in the beginning of subrecords when rowIndex is 0', () => {
        state = reducer(state, actions.insertSubrecordRow(0));
        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);
        
        expect(sourceSubrecords).to.eql([undefined, ssub1, ssub2]);
        expect(targetSubrecords).to.eql([undefined, tsub1, tsub2]);
        expect(mergedSubrecords).to.eql([undefined, undefined, msub1]);
        expect(subrecordActions).to.eql([undefined, SubrecordActionTypes.BLOCK, SubrecordActionTypes.MERGE]);
        
      });

      it('inserts empty row in between of subrecords', () => {
        state = reducer(state, actions.insertSubrecordRow(1));
        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined, ssub2]);
        expect(targetSubrecords).to.eql([tsub1, undefined, tsub2]);
        expect(mergedSubrecords).to.eql([undefined, undefined, msub1]);
        expect(subrecordActions).to.eql([SubrecordActionTypes.BLOCK, undefined, SubrecordActionTypes.MERGE]);
      });
      
      it('inserts empty row after subrecords', () => {
        state = reducer(state, actions.insertSubrecordRow(2));
        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, ssub2, undefined]);
        expect(targetSubrecords).to.eql([tsub1, tsub2, undefined]);
        expect(mergedSubrecords).to.eql([undefined, msub1, undefined]);
        expect(subrecordActions).to.eql([SubrecordActionTypes.BLOCK, SubrecordActionTypes.MERGE, undefined]);
      });
      
    });


    describe('insert row with unequal amount of records', function() {

      let state;
      beforeEach(() => {
        state = reducer(undefined, actions.setSourceRecord(testRecordObject, [ssub1]));
        state = reducer(state, actions.setTargetRecord(otherTestRecordObject, [tsub1, tsub2, tsub3]));
      });

      it('inserts empty row in the beginning of subrecords when rowIndex is 0', () => {
        state = reducer(state, actions.insertSubrecordRow(0));
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([undefined, ssub1]);
        expect(targetSubrecords).to.eql([undefined, tsub1, tsub2, tsub3]);
      });

      it('inserts empty row in between of subrecords', () => {
        state = reducer(state, actions.insertSubrecordRow(1));
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined]);
        expect(targetSubrecords).to.eql([tsub1, undefined, tsub2, tsub3]);
      });
      
      it('inserts empty row only between subrecords of longer list', () => {
        state = reducer(state, actions.insertSubrecordRow(2));
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1]);
        expect(targetSubrecords).to.eql([tsub1, tsub2, undefined, tsub3]);
      });
      
      it('inserts empty row only after subrecords of longer list', () => {
        state = reducer(state, actions.insertSubrecordRow(3));
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1]);
        expect(targetSubrecords).to.eql([tsub1, tsub2, tsub3, undefined]);
      });

    });


    describe('remove row', function() {

      let state;
      beforeEach(() => {
        state = undefined;
        state = reducer(state, actions.setSourceRecord(testRecordObject, [undefined, ssub1, undefined, ssub2, undefined]));
        state = reducer(state, actions.setTargetRecord(otherTestRecordObject, [undefined, tsub1, undefined, tsub2, undefined]));
        state = reducer(state, actions.setSubrecordAction(1, SubrecordActionTypes.BLOCK));
        state = reducer(state, actions.setSubrecordAction(3, SubrecordActionTypes.MERGE));
        state = reducer(state, actions.setMergedSubrecord(3, msub1));
      });
    
      it('removes empty row in the beginning of subrecords when rowIndex is 0', () => {
        state = reducer(state, actions.removeSubrecordRow(0));
        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined, ssub2, undefined]);
        expect(targetSubrecords).to.eql([tsub1, undefined, tsub2, undefined]);
        expect(mergedSubrecords).to.eql([undefined, undefined, msub1]);
        expect(subrecordActions).to.eql([SubrecordActionTypes.BLOCK, undefined, SubrecordActionTypes.MERGE]);

      });

      it('removes empty row in between of subrecords', () => {
        state = reducer(state, actions.removeSubrecordRow(2));
        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([undefined, ssub1, ssub2, undefined]);
        expect(targetSubrecords).to.eql([undefined, tsub1, tsub2, undefined]);
        expect(mergedSubrecords).to.eql([undefined, undefined, msub1]);
        expect(subrecordActions).to.eql([undefined, SubrecordActionTypes.BLOCK, SubrecordActionTypes.MERGE]);

      });
      
      it('removes empty row after subrecords', () => {
        state = reducer(state, actions.removeSubrecordRow(4));
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([undefined, ssub1, undefined, ssub2]);
        expect(targetSubrecords).to.eql([undefined, tsub1, undefined, tsub2]);
      });

      it('does not remove non-empty rows', () => {
        state = reducer(state, actions.removeSubrecordRow(1));
        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([undefined, ssub1, undefined, ssub2, undefined]);
        expect(targetSubrecords).to.eql([undefined, tsub1, undefined, tsub2, undefined]);
        expect(mergedSubrecords).to.eql([undefined, undefined, undefined, msub1]);
        expect(subrecordActions).to.eql([undefined, SubrecordActionTypes.BLOCK, undefined, SubrecordActionTypes.MERGE]);

      });
      
      it('does not remove rows with target subrecord', () => {
        state = reducer(state, actions.setSourceRecord(testRecordObject, [ssub1, undefined, undefined, ssub2, undefined]));
        state = reducer(state, actions.removeSubrecordRow(1));

        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined, undefined, ssub2, undefined]);
        expect(targetSubrecords).to.eql([undefined, tsub1, undefined, tsub2, undefined]);
        expect(mergedSubrecords).to.eql([undefined, undefined, undefined, msub1]);
        expect(subrecordActions).to.eql([undefined, SubrecordActionTypes.BLOCK, undefined, SubrecordActionTypes.MERGE]);

      });
      
    });

    describe('change source and target subrecord rows', function() {
      let state;
      beforeEach(() => {
        state = undefined;
        state = reducer(state, actions.setSourceRecord(testRecordObject, [undefined, ssub1, ssub2]));
        state = reducer(state, actions.setTargetRecord(otherTestRecordObject, [tsub1, undefined, tsub2]));
        state = reducer(state, actions.setSubrecordAction(1, SubrecordActionTypes.COPY));
        state = reducer(state, actions.setSubrecordAction(2, SubrecordActionTypes.MERGE));
        state = reducer(state, actions.setMergedSubrecord(1, ssub1));
        state = reducer(state, actions.setMergedSubrecord(2, msub1));

      });

      it('moves source subrecord at 1 to 0', () => {

        state = reducer(state, actions.changeSourceSubrecordRow(1, 0));
        const { sourceSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined, ssub2]);
        expect(mergedSubrecords).to.eql([undefined, undefined, msub1]);
        expect(subrecordActions).to.eql([undefined, undefined, SubrecordActionTypes.MERGE]);

      });

      it('moves source subrecord at 2 to 0', () => {
        state = reducer(state, actions.changeSourceSubrecordRow(2, 0));

        const { sourceSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub2, ssub1, undefined]);
        expect(mergedSubrecords).to.eql([undefined, ssub1, undefined]);
        expect(subrecordActions).to.eql([undefined, SubrecordActionTypes.COPY, undefined]);


      });

      it('does nothing if trying to move subrecord to non-undefined index', () => {
        state = reducer(state, actions.changeSourceSubrecordRow(2, 1));

        const { sourceSubrecords } = subrecords(state);
        expect(sourceSubrecords).to.eql([undefined, ssub1, ssub2]);

      });

      it('does nothing if trying to move undefined index', () => {
        state = reducer(state, actions.changeSourceSubrecordRow(0, 1));
        const { sourceSubrecords } = subrecords(state);
        expect(sourceSubrecords).to.eql([undefined, ssub1, ssub2]);

      });

    });


    describe('change whole subrecord row', function() {
      let state;
      beforeEach(() => {
        state = undefined;
        state = reducer(state, actions.setSourceRecord(testRecordObject, [undefined, ssub1, ssub2]));
        state = reducer(state, actions.setTargetRecord(otherTestRecordObject,    [tsub1, undefined, tsub2]));
        state = reducer(state, actions.setSubrecordAction(1, SubrecordActionTypes.COPY));
        state = reducer(state, actions.setSubrecordAction(2, SubrecordActionTypes.MERGE));
        state = reducer(state, actions.setMergedSubrecord(1, ssub1));
        state = reducer(state, actions.setMergedSubrecord(2, msub1));

      });

      it('moves whole subrecord row at 1 to 0', () => {
        state = reducer(state, actions.changeSubrecordRow(1, 0));

        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords.map(toName)).to.eql([ssub1, undefined, ssub2].map(toName));
        expect(targetSubrecords.map(toName)).to.eql([undefined, tsub1, tsub2].map(toName));
        expect(mergedSubrecords.map(toName)).to.eql([ssub1, undefined, msub1].map(toName));
        expect(subrecordActions).to.eql([SubrecordActionTypes.COPY, undefined, SubrecordActionTypes.MERGE]);

      });

      it('moves whole subrecord row at 2 to 0', () => {

        state = reducer(state, actions.changeSubrecordRow(2, 0));
        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub2, undefined, ssub1]);
        expect(targetSubrecords).to.eql([tsub2, tsub1, undefined]);
        expect(mergedSubrecords).to.eql([msub1, undefined, ssub1]);
        expect(subrecordActions).to.eql([SubrecordActionTypes.MERGE, undefined, SubrecordActionTypes.COPY]);

      });

      it('moves whole subrecord row at 0 to 3', () => {

        state = reducer(state, actions.changeSubrecordRow(0, 3));

        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, ssub2, undefined, undefined]);
        expect(targetSubrecords).to.eql([undefined, tsub2, undefined, tsub1]);
        expect(mergedSubrecords).to.eql([ssub1, msub1, undefined, undefined]);
        expect(subrecordActions).to.eql([SubrecordActionTypes.COPY, SubrecordActionTypes.MERGE, undefined, undefined]);

      });

      it('does nothing when moving whole subrecord row at 0 to 0', () => {
        state = reducer(state, actions.changeSubrecordRow(0, 0));

        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([undefined, ssub1, ssub2]);
        expect(targetSubrecords).to.eql([tsub1, undefined, tsub2]);
        expect(mergedSubrecords).to.eql([undefined, ssub1, msub1]);
        expect(subrecordActions).to.eql([undefined, SubrecordActionTypes.COPY, SubrecordActionTypes.MERGE]);

      });

      it('moves whole subrecord row at 0 to 1', () => {

        state = reducer(state, actions.changeSubrecordRow(0, 1));

        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined, ssub2]);
        expect(targetSubrecords).to.eql([undefined, tsub1, tsub2]);
        expect(mergedSubrecords).to.eql([ssub1, undefined, msub1]);
        expect(subrecordActions).to.eql([SubrecordActionTypes.COPY, undefined, SubrecordActionTypes.MERGE]);

      });

      it('moves whole subrecord row at 8 to 0', () => {
        state = reducer(state, actions.changeSubrecordRow(8, 0));

        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords.map(toName)).to.eql([undefined, undefined, ssub1, ssub2].map(toName));
        expect(targetSubrecords.map(toName)).to.eql([undefined, tsub1, undefined, tsub2].map(toName));
        expect(mergedSubrecords.map(toName)).to.eql([undefined, undefined, ssub1, msub1].map(toName));
        expect(subrecordActions).to.eql([undefined, undefined, SubrecordActionTypes.COPY, SubrecordActionTypes.MERGE]);

      });

    });

    describe('change whole subrecord row when other record has less subrecords', function() {
      let state;
      beforeEach(() => {
        state = reducer(state, actions.setSourceRecord(testRecordObject, [ssub1, ssub2]));
        state = reducer(state, actions.setTargetRecord(otherTestRecordObject,    [tsub1, tsub2, tsub3]));
        state = reducer(state, actions.setSubrecordAction(0, SubrecordActionTypes.MERGE));
        state = reducer(state, actions.setSubrecordAction(1, SubrecordActionTypes.MERGE));
        state = reducer(state, actions.setMergedSubrecord(0, msub1));
        state = reducer(state, actions.setMergedSubrecord(1, msub1));

      });

      it('moves whole subrecord row at 0 to 2', () => {
        state = reducer(state, actions.changeSubrecordRow(0, 2));

        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords.map(toName)).to.eql([ssub2, undefined, ssub1].map(toName));
        expect(targetSubrecords.map(toName)).to.eql([tsub2, tsub3, tsub1].map(toName));
        expect(mergedSubrecords.map(toName)).to.eql([msub1, undefined, msub1].map(toName));
        expect(subrecordActions).to.eql([SubrecordActionTypes.MERGE, undefined, SubrecordActionTypes.MERGE]);

      });
    });

  });
});

