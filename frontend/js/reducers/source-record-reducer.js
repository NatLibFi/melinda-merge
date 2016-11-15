import { Map } from 'immutable'; 
import {LOAD_SOURCE_RECORD, SET_SOURCE_RECORD, SET_SOURCE_RECORD_ERROR, SET_SOURCE_RECORD_ID, ADD_SOURCE_RECORD_FIELD, REMOVE_SOURCE_RECORD_FIELD } from '../ui-actions';
import {RESET_WORKSPACE} from '../constants/action-type-constants';
import MarcRecord from 'marc-record-js';

const INITIAL_STATE = Map({
  state: 'EMPTY'
});

export default function sourceRecord(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOAD_SOURCE_RECORD:
      return loadSourceRecord(state, action.id);
    case SET_SOURCE_RECORD:
      return setSourceRecord(state, action.record, action.subrecords);
    case SET_SOURCE_RECORD_ERROR:
      return setSourceRecordError(state, action.error);
    case SET_SOURCE_RECORD_ID:
      return setSourceRecordId(state, action.recordId);
    case ADD_SOURCE_RECORD_FIELD: 
      return setFieldSelected(state, action.field);
    case REMOVE_SOURCE_RECORD_FIELD:
      return setFieldUnselected(state, action.field);
    case RESET_WORKSPACE:
      return INITIAL_STATE;
  }
  return state;
}

export function loadSourceRecord(state, recordId) {
  return Map({
    id: recordId,
    state: 'LOADING'
  });
  
}

export function setSourceRecord(state, record) {
  
  return state
    .updateIn(['state'], () => 'LOADED')
    .updateIn(['record'], () => record);
}

export function setSourceRecordError(state, error) {
  return state
    .setIn(['state'], 'ERROR')
    .setIn(['errorMessage'], error);
}

export function setSourceRecordId(state, recordId) {
  return state.setIn(['id'], recordId);
}

export function setFieldSelected(state, field) {
  const record = state.get('record');
  record.fields
    .filter(recordField => recordField.uuid === field.uuid)
    .forEach(recordField => {
      recordField.fromOther = true;
      recordField.wasUsed = true;
    });
  return state.set('record', new MarcRecord(record));

}

export function setFieldUnselected(state, field) {
  const record = state.get('record');
  record.fields
    .filter(recordField => recordField.uuid === field.uuid)
    .forEach(recordField => {
      recordField.fromOther = false;
      recordField.wasUsed = false;
    });
  return state.set('record', new MarcRecord(record));
}