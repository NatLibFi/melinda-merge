import { Map } from 'immutable'; 
import {CLEAR_MERGED_RECORD, SET_MERGED_RECORD_ERROR, SET_MERGED_RECORD, ADD_SOURCE_RECORD_FIELD, REMOVE_SOURCE_RECORD_FIELD } from '../ui-actions';
import {RESET_WORKSPACE} from '../constants/action-type-constants';
import { DEFAULT_MERGED_RECORD } from '../root-reducer';
import MarcRecord from 'marc-record-js';

const INITIAL_STATE = Map({
  state: 'EMPTY'
});

export default function mergedRecord(state = INITIAL_STATE, action) {
  switch (action.type) {
    case CLEAR_MERGED_RECORD:
      return clearMergedRecord(state);
    case SET_MERGED_RECORD_ERROR:
      return setMergedRecordError(state, action.error);
    case SET_MERGED_RECORD:
      return setMergedRecord(state, action.record);
    case ADD_SOURCE_RECORD_FIELD:
      return addField(state, action.field);
    case REMOVE_SOURCE_RECORD_FIELD:
      return removeField(state, action.field);
    case RESET_WORKSPACE:
      return INITIAL_STATE;
  }
  return state;
}

export function setMergedRecord(state, record) {

  return state
    .updateIn(['state'], () => 'LOADED')
    .updateIn(['record'], () => record);
}

export function clearMergedRecord() {
  return DEFAULT_MERGED_RECORD;
}

export function setMergedRecordError(state, errorMessage) {
  return state
    .updateIn(['state'], () => 'ERROR')
    .updateIn(['errorMessage'], () => errorMessage);
}

export function addField(state, field) {
  const record = state.get('record');
  if (isControlField(field)) {
    record.insertControlField(field);
  } else {
    record.insertField(field);
  }
  
  return state.set('record', new MarcRecord(record));
}

export function removeField(state, field) {
  const record = state.get('record');
  record.fields = record.fields.filter(currentField => currentField.uuid !== field.uuid);
  return state.set('record', new MarcRecord(record));
}

function isControlField(field) {
  return field.subfields === undefined;
}