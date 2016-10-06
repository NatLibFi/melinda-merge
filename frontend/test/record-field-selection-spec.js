import {expect} from 'chai';
import * as actions from '../js/ui-actions';
import reducer from '../js/root-reducer';
import MarcRecord from 'marc-record-js';

describe('record field selections', () => {

  const fieldInSourceRecord = { tag: '245', uuid: 2, subfields: [{
    code: 'a',
    value: 'a-field-from-other'
  }]};

  const preferredRecordObject = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '00384794' },
      { tag: '003', value: 'FI-MELINDA' },
      { tag: '008', value: 'SOURCE' },
      { tag: '222', uuid: 1, subfields: [{
        code: 'a',
        value: 'a-field-from-preferred'
      }]}
    ]
  });

  const otherRecordObject = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '00384794' },
      { tag: '003', value: 'FI-MELINDA' },
      { tag: '005', value: 'FIELD-005' },
      { tag: '008', value: 'TARGET' },
      { tag: '009', value: 'TARGET' },
      fieldInSourceRecord
    ]
  });

  const mergedRecordObject = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '00384794' },
      { tag: '003', value: 'FI-MELINDA' },
      { tag: '005', value: 'FIELD-005' },
      { tag: '008', value: 'TARGET' },
      { tag: '009', value: 'TARGET' },
      { tag: '222', uuid: 1, subfields: [{
        code: 'a',
        value: 'a-field-from-preferred'
      }]}
    ]
  });

  describe('on ADD_SOURCE_RECORD_FIELD', () => {
    let state;
    beforeEach(() => {
      state = undefined;
      state = reducer(state, actions.setSourceRecord(otherRecordObject));
      state = reducer(state, actions.setTargetRecord(preferredRecordObject));
      state = reducer(state, actions.setMergedRecord(mergedRecordObject));
      state = reducer(state, actions.addSourceRecordField(fieldInSourceRecord));
    });

    it('adds the source field to the merged record', () => {
      expect(state.getIn(['mergedRecord', 'record']).fields).to.contain(fieldInSourceRecord);
    });

    it('sets flags in source record to indicate the field is being used in merge result', () => {
      const field = state.getIn(['sourceRecord', 'record']).fields.find(f => f.tag === '245');
      expect(field.wasUsed).to.eql(true);
    });
  });

  describe('on REMOVE_SOURCE_RECORD_FIELD', () => {
    let state;
    beforeEach(() => {
      state = undefined;
      state = reducer(state, actions.setSourceRecord(otherRecordObject));
      state = reducer(state, actions.setTargetRecord(preferredRecordObject));
      state = reducer(state, actions.setMergedRecord(mergedRecordObject));
      state = reducer(state, actions.addSourceRecordField(fieldInSourceRecord));
      state = reducer(state, actions.removeSourceRecordField(fieldInSourceRecord));
    });

    it('removes the field from the merged record', () => {
      expect(state.getIn(['mergedRecord', 'record']).fields).not.to.contain(fieldInSourceRecord);
    });

    it('sets flags in source record to indicate the field is not being used in merge result', () => {
      const field = state.getIn(['sourceRecord', 'record']).fields.find(f => f.tag === '245');
      expect(field.wasUsed).to.eql(false);
    });
  });

});
