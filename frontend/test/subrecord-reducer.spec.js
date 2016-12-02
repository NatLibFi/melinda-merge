import {expect} from 'chai';
import MarcRecord from 'marc-record-js';
import { INITIAL_STATE } from '../js/root-reducer';
import { SubrecordActionTypes } from '../js/constants';
import { setSourceRecord, setTargetRecord } from '../js/ui-actions';
import { setSubrecordAction, setMergedSubrecord, insertSubrecordRow, removeSubrecordRow, changeSourceSubrecordRow, changeSubrecordRow, updateSubrecordArrangement } from '../js/action-creators/subrecord-actions';
import reducer from '../js/root-reducer';
import { subrecordRows } from '../js/selectors/subrecord-selectors';
import _ from 'lodash';

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

      const sourceSubrecords = _.map(subrecordRows(state), 'sourceRecord');
      const targetSubrecords = _.map(subrecordRows(state), 'targetRecord');
      const mergedSubrecords = _.map(subrecordRows(state), 'mergedRecord');
      const subrecordActions = _.map(subrecordRows(state), 'selectedAction');
      return {sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions};
    }
    function rowId(state, index) {
      return state.getIn(['subrecords', 'index']).get(index);
    }

    describe('set subrecords', function() {

      describe('when records are swapped', () => {
        let state;

        beforeEach(() => {
          state = reducer(INITIAL_STATE, setSourceRecord(testRecordObject, [ssub1, ssub2]));
          state = reducer(state, setTargetRecord(otherTestRecordObject, []));
          
          state = reducer(state, setSourceRecord(otherTestRecordObject, []));
          state = reducer(state, setTargetRecord(testRecordObject, [ssub1, ssub2]));
        });

        it('sets the subfields of target record', () => {
          const { targetSubrecords } = subrecords(state);
          expect(targetSubrecords).to.eql([ssub1, ssub2]);
        });

        it('sets the subfields of source record', () => {
          const { sourceSubrecords } = subrecords(state);
          expect(sourceSubrecords).to.eql([undefined, undefined]);
        });

      });

      describe('when records are swapped other way', () => {
        let state;

        beforeEach(() => {
          state = INITIAL_STATE;
          state = reducer(state, setSourceRecord(otherTestRecordObject, []));
          state = reducer(state, setTargetRecord(testRecordObject, [ssub1, ssub2]));

          state = reducer(state, setSourceRecord(testRecordObject, [ssub1, ssub2]));
          state = reducer(state, setTargetRecord(otherTestRecordObject, []));
          
        });

        it('sets the subfields of target record', () => {
          const { sourceSubrecords } = subrecords(state);
          expect(sourceSubrecords).to.eql([ssub1, ssub2]);
        });

        it('sets the subfields of source record', () => {
          const { targetSubrecords } = subrecords(state);
          expect(targetSubrecords).to.eql([undefined, undefined]);
        });

      });


    });

    describe('set subrecord action', function() {
      let state;
      beforeEach(() => {
        state = reducer(INITIAL_STATE, setSourceRecord(testRecordObject, [ssub1, ssub2]));
        state = reducer(state, setTargetRecord(otherTestRecordObject, [tsub1, tsub2]));
        state = reducer(state, updateSubrecordArrangement(_.zip([ssub1, ssub2], [tsub1, tsub2])));

      });

      it('sets the action', () => {
        state = reducer(state, setSubrecordAction(rowId(state, 0), SubrecordActionTypes.MERGE));
        const subrecordActions = _.map(subrecordRows(state), 'selectedAction');
        expect(subrecordActions).to.eql([SubrecordActionTypes.MERGE, undefined]);

      });

      it('sets the action to correct position', () => {
        state = reducer(state, setSubrecordAction(rowId(state, 1), SubrecordActionTypes.MERGE));
        const subrecordActions = _.map(subrecordRows(state), 'selectedAction');
        expect(subrecordActions).to.eql([undefined, SubrecordActionTypes.MERGE]);
      });

    });

    describe('set merged record\'s subrecords', () => {
      let state;
      beforeEach(() => {
        state = reducer(INITIAL_STATE, setSourceRecord(testRecordObject, [ssub1, ssub2]));
        state = reducer(state, setTargetRecord(otherTestRecordObject, [tsub1, tsub2]));
        state = reducer(state, updateSubrecordArrangement(_.zip([ssub1, ssub2], [tsub1, tsub2])));

      });

      it('should set merged subrecord at position', () => {

        state = reducer(state, setMergedSubrecord(rowId(state, 1), msub1));
        const mergedSubrecords = _.map(subrecordRows(state), 'mergedRecord');
        expect(mergedSubrecords).to.eql([undefined, msub1]);

      });

      it('should set merged subrecord at beginning if position=0', () => {
        state = reducer(state, setMergedSubrecord(rowId(state, 0), msub1));
        const mergedSubrecords = _.map(subrecordRows(state), 'mergedRecord');
        expect(mergedSubrecords).to.eql([msub1, undefined]);

      });
       
    }); 

    describe('insert row with equal amount of subrecords', function() {

      let state;
      beforeEach(() => {
        state = undefined;
        state = reducer(state, setSourceRecord(testRecordObject, [ssub1, ssub2]));
        state = reducer(state, setTargetRecord(otherTestRecordObject, [tsub1, tsub2]));
        state = reducer(state, updateSubrecordArrangement(_.zip([ssub1, ssub2], [tsub1, tsub2])));
        state = reducer(state, setSubrecordAction(rowId(state, 0), SubrecordActionTypes.BLOCK));
        state = reducer(state, setSubrecordAction(rowId(state, 1), SubrecordActionTypes.MERGE));
        state = reducer(state, setMergedSubrecord(rowId(state, 1), msub1));

      });

      it('inserts empty row in the beginning of subrecords when rowIndex is 0', () => {
        state = reducer(state, insertSubrecordRow(0));
        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);
        
        expect(sourceSubrecords).to.eql([undefined, ssub1, ssub2]);
        expect(targetSubrecords).to.eql([undefined, tsub1, tsub2]);
        expect(mergedSubrecords).to.eql([undefined, undefined, msub1]);
        expect(subrecordActions).to.eql([undefined, SubrecordActionTypes.BLOCK, SubrecordActionTypes.MERGE]);
        
      });

      it('inserts empty row in between of subrecords', () => {
        state = reducer(state, insertSubrecordRow(1));
        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined, ssub2]);
        expect(targetSubrecords).to.eql([tsub1, undefined, tsub2]);
        expect(mergedSubrecords).to.eql([undefined, undefined, msub1]);
        expect(subrecordActions).to.eql([SubrecordActionTypes.BLOCK, undefined, SubrecordActionTypes.MERGE]);
      });
      
      it('inserts empty row after subrecords', () => {
        state = reducer(state, insertSubrecordRow(2));
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
        state = reducer(undefined, setSourceRecord(testRecordObject, [ssub1]));
        state = reducer(state, setTargetRecord(otherTestRecordObject, [tsub1, tsub2, tsub3]));
        state = reducer(state, updateSubrecordArrangement(_.zip([ssub1], [tsub1, tsub2, tsub3])));
      });

      it('inserts empty row in the beginning of subrecords when rowIndex is 0', () => {
        state = reducer(state, insertSubrecordRow(0));
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([undefined, ssub1, undefined, undefined]);
        expect(targetSubrecords).to.eql([undefined, tsub1, tsub2, tsub3]);
      });

      it('inserts empty row in between of subrecords', () => {
        state = reducer(state, insertSubrecordRow(1));
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined, undefined, undefined]);
        expect(targetSubrecords).to.eql([tsub1, undefined, tsub2, tsub3]);
      });
      
      it('inserts empty row only between subrecords of longer list', () => {
        state = reducer(state, insertSubrecordRow(2));
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined, undefined, undefined]);
        expect(targetSubrecords).to.eql([tsub1, tsub2, undefined, tsub3]);
      });
      
      it('inserts empty row only after subrecords of longer list', () => {
        state = reducer(state, insertSubrecordRow(3));
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined, undefined, undefined]);
        expect(targetSubrecords).to.eql([tsub1, tsub2, tsub3, undefined]);
      });

    });


    describe('remove row', function() {

      let state;
      beforeEach(() => {
        state = undefined;
        state = reducer(state, setSourceRecord(testRecordObject, [undefined, ssub1, undefined, ssub2, undefined]));
        state = reducer(state, setTargetRecord(otherTestRecordObject, [undefined, tsub1, undefined, tsub2, undefined]));
        state = reducer(state, updateSubrecordArrangement(_.zip([undefined, ssub1, undefined, ssub2, undefined], [undefined, tsub1, undefined, tsub2, undefined])));
        state = reducer(state, setSubrecordAction(rowId(state, 1), SubrecordActionTypes.BLOCK));
        state = reducer(state, setSubrecordAction(rowId(state, 3), SubrecordActionTypes.MERGE));
        state = reducer(state, setMergedSubrecord(rowId(state, 3), msub1));
      });
    
      it('removes empty row in the beginning of subrecords when rowIndex is 0', () => {
        state = reducer(state, removeSubrecordRow(rowId(state, 0)));
        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined, ssub2, undefined]);
        expect(targetSubrecords).to.eql([tsub1, undefined, tsub2, undefined]);
        expect(mergedSubrecords).to.eql([undefined, undefined, msub1, undefined]);
        expect(subrecordActions).to.eql([SubrecordActionTypes.BLOCK, undefined, SubrecordActionTypes.MERGE, undefined]);

      });

      it('removes empty row in between of subrecords', () => {
        state = reducer(state, removeSubrecordRow(rowId(state, 2)));
        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([undefined, ssub1, ssub2, undefined]);
        expect(targetSubrecords).to.eql([undefined, tsub1, tsub2, undefined]);
        expect(mergedSubrecords).to.eql([undefined, undefined, msub1, undefined]);
        expect(subrecordActions).to.eql([undefined, SubrecordActionTypes.BLOCK, SubrecordActionTypes.MERGE, undefined]);

      });
      
      it('removes empty row after subrecords', () => {
        state = reducer(state, removeSubrecordRow(rowId(state, 4)));
        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([undefined, ssub1, undefined, ssub2]);
        expect(targetSubrecords).to.eql([undefined, tsub1, undefined, tsub2]);
      });

      it('does not remove non-empty rows', () => {
        state = reducer(state, removeSubrecordRow(rowId(state, 1)));
        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([undefined, ssub1, undefined, ssub2, undefined]);
        expect(targetSubrecords).to.eql([undefined, tsub1, undefined, tsub2, undefined]);
        expect(mergedSubrecords).to.eql([undefined, undefined, undefined, msub1, undefined]);
        expect(subrecordActions).to.eql([undefined, SubrecordActionTypes.BLOCK, undefined, SubrecordActionTypes.MERGE, undefined]);

      });
      
      it('does not remove rows with target subrecord', () => {
        let sourceSubrecordList = [ssub1, undefined, undefined, ssub2, undefined];
        let targetSubrecordList = [undefined, tsub1, undefined, tsub2, undefined];

        state = reducer(state, setSourceRecord(testRecordObject, sourceSubrecordList));
        state = reducer(state, updateSubrecordArrangement(_.zip(sourceSubrecordList, targetSubrecordList)));

        state = reducer(state, removeSubrecordRow(rowId(state, 1)));

        const { sourceSubrecords, targetSubrecords} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined, undefined, ssub2, undefined]);
        expect(targetSubrecords).to.eql([undefined, tsub1, undefined, tsub2, undefined]);
     
      });
      
    });

    describe('change source and target subrecord rows', function() {
      let state;
      beforeEach(() => {
        state = undefined;
        state = reducer(state, setSourceRecord(testRecordObject, [undefined, ssub1, ssub2]));
        state = reducer(state, setTargetRecord(otherTestRecordObject, [tsub1, undefined, tsub2]));
        state = reducer(state, updateSubrecordArrangement(_.zip([undefined, ssub1, ssub2], [tsub1, undefined, tsub2])));

        state = reducer(state, setSubrecordAction(rowId(state, 1), SubrecordActionTypes.COPY));
        state = reducer(state, setSubrecordAction(rowId(state, 2), SubrecordActionTypes.MERGE));
        state = reducer(state, setMergedSubrecord(rowId(state, 1), ssub1));
        state = reducer(state, setMergedSubrecord(rowId(state, 2), msub1));

      });

      it('moves source subrecord at 1 to 0', () => {

        state = reducer(state, changeSourceSubrecordRow(rowId(state, 1), rowId(state, 0)));
        const { sourceSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined, ssub2]);
        expect(mergedSubrecords).to.eql([undefined, undefined, msub1]);
        expect(subrecordActions).to.eql([undefined, undefined, SubrecordActionTypes.MERGE]);

      });

      it('moves source subrecord at 2 to 0', () => {
        state = reducer(state, changeSourceSubrecordRow(rowId(state, 2), rowId(state, 0)));

        const { sourceSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub2, ssub1, undefined]);
        expect(mergedSubrecords).to.eql([undefined, ssub1, undefined]);
        expect(subrecordActions).to.eql([undefined, SubrecordActionTypes.COPY, undefined]);


      });

      it('does nothing if trying to move subrecord to non-undefined index', () => {
        state = reducer(state, changeSourceSubrecordRow(rowId(state, 2), rowId(state, 1)));

        const { sourceSubrecords } = subrecords(state);
        expect(sourceSubrecords).to.eql([undefined, ssub1, ssub2]);

      });

      it('does nothing if trying to move undefined index', () => {
        state = reducer(state, changeSourceSubrecordRow(rowId(state, 0), rowId(state, 1)));
        const { sourceSubrecords } = subrecords(state);
        expect(sourceSubrecords).to.eql([undefined, ssub1, ssub2]);

      });

    });


    describe('change whole subrecord row', function() {
      let state;
      beforeEach(() => {
        state = undefined;
        state = reducer(state, setSourceRecord(testRecordObject, [undefined, ssub1, ssub2]));
        state = reducer(state, setTargetRecord(otherTestRecordObject, [tsub1, undefined, tsub2]));
        state = reducer(state, updateSubrecordArrangement(_.zip([undefined, ssub1, ssub2], [tsub1, undefined, tsub2])));

        state = reducer(state, setSubrecordAction(rowId(state, 1), SubrecordActionTypes.COPY));
        state = reducer(state, setSubrecordAction(rowId(state, 2), SubrecordActionTypes.MERGE));
        state = reducer(state, setMergedSubrecord(rowId(state, 1), ssub1));
        state = reducer(state, setMergedSubrecord(rowId(state, 2), msub1));

      });

      it('moves whole subrecord row at 1 to 0', () => {
        state = reducer(state, changeSubrecordRow(1, 0));

        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords.map(toName)).to.eql([ssub1, undefined, ssub2].map(toName));
        expect(targetSubrecords.map(toName)).to.eql([undefined, tsub1, tsub2].map(toName));
        expect(mergedSubrecords.map(toName)).to.eql([ssub1, undefined, msub1].map(toName));
        expect(subrecordActions).to.eql([SubrecordActionTypes.COPY, undefined, SubrecordActionTypes.MERGE]);

      });

      it('moves whole subrecord row at 2 to 0', () => {

        state = reducer(state, changeSubrecordRow(2, 0));
        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub2, undefined, ssub1]);
        expect(targetSubrecords).to.eql([tsub2, tsub1, undefined]);
        expect(mergedSubrecords).to.eql([msub1, undefined, ssub1]);
        expect(subrecordActions).to.eql([SubrecordActionTypes.MERGE, undefined, SubrecordActionTypes.COPY]);

      });

      it('moves whole subrecord row at 0 to 3', () => {

        state = reducer(state, changeSubrecordRow(0, 3));

        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, ssub2, undefined, undefined]);
        expect(targetSubrecords).to.eql([undefined, tsub2, undefined, tsub1]);
        expect(mergedSubrecords).to.eql([ssub1, msub1, undefined, undefined]);
        expect(subrecordActions).to.eql([SubrecordActionTypes.COPY, SubrecordActionTypes.MERGE, undefined, undefined]);

      });

      it('does nothing when moving whole subrecord row at 0 to 0', () => {
        state = reducer(state, changeSubrecordRow(0, 0));

        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([undefined, ssub1, ssub2]);
        expect(targetSubrecords).to.eql([tsub1, undefined, tsub2]);
        expect(mergedSubrecords).to.eql([undefined, ssub1, msub1]);
        expect(subrecordActions).to.eql([undefined, SubrecordActionTypes.COPY, SubrecordActionTypes.MERGE]);

      });

      it('moves whole subrecord row at 0 to 1', () => {

        state = reducer(state, changeSubrecordRow(0, 1));

        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords).to.eql([ssub1, undefined, ssub2]);
        expect(targetSubrecords).to.eql([undefined, tsub1, tsub2]);
        expect(mergedSubrecords).to.eql([ssub1, undefined, msub1]);
        expect(subrecordActions).to.eql([SubrecordActionTypes.COPY, undefined, SubrecordActionTypes.MERGE]);

      });

      it('moves whole subrecord row at 8 to 0', () => {
        state = reducer(state, changeSubrecordRow(8, 0));

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
        state = reducer(state, setSourceRecord(testRecordObject, [ssub1, ssub2]));
        state = reducer(state, setTargetRecord(otherTestRecordObject, [tsub1, tsub2, tsub3]));
        state = reducer(state, updateSubrecordArrangement(_.zip([ssub1, ssub2], [tsub1, tsub2, tsub3])));

        state = reducer(state, setSubrecordAction(rowId(state, 0), SubrecordActionTypes.MERGE));
        state = reducer(state, setSubrecordAction(rowId(state, 1), SubrecordActionTypes.MERGE));
        state = reducer(state, setMergedSubrecord(rowId(state, 0), msub1));
        state = reducer(state, setMergedSubrecord(rowId(state, 1), msub1));

      });

      it('moves whole subrecord row at 0 to 2', () => {
        state = reducer(state, changeSubrecordRow(0, 2));

        const { sourceSubrecords, targetSubrecords, mergedSubrecords, subrecordActions} = subrecords(state);

        expect(sourceSubrecords.map(toName)).to.eql([ssub2, undefined, ssub1].map(toName));
        expect(targetSubrecords.map(toName)).to.eql([tsub2, tsub3, tsub1].map(toName));
        expect(mergedSubrecords.map(toName)).to.eql([msub1, undefined, msub1].map(toName));
        expect(subrecordActions).to.eql([SubrecordActionTypes.MERGE, undefined, SubrecordActionTypes.MERGE]);

      });
    });

  });
});

