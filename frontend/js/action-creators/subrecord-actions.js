import { 
  INSERT_SUBRECORD_ROW, REMOVE_SUBRECORD_ROW, CHANGE_SOURCE_SUBRECORD_ROW, CHANGE_TARGET_SUBRECORD_ROW, 
  CHANGE_SUBRECORD_ROW, SET_SUBRECORD_ACTION, SET_MERGED_SUBRECORD, SET_MERGED_SUBRECORD_ERROR, 
  EXPAND_SUBRECORD_ROW, COMPRESS_SUBRECORD_ROW } from '../constants/action-type-constants';

import { SubrecordActionTypes } from '../constants';
import createRecordMerger from 'marc-record-merge';
import mergeConfiguration from '../config/merge-config';
import MarcRecordMergeMelindaUtils from '../vendor/marc-record-merge-melindautils';

export function expandSubrecordRow(rowIndex) {
  return { type: EXPAND_SUBRECORD_ROW, rowIndex };
}

export function compressSubrecordRow(rowIndex) {
  return { type: COMPRESS_SUBRECORD_ROW, rowIndex };
}

export function insertSubrecordRow(rowIndex) {
  return { 'type': INSERT_SUBRECORD_ROW, rowIndex };
}

export function removeSubrecordRow(rowIndex) {
  return { 'type': REMOVE_SUBRECORD_ROW, rowIndex };
}

export function changeSourceSubrecordRow(fromRowIndex, toRowIndex) {
  return { 'type': CHANGE_SOURCE_SUBRECORD_ROW, fromRowIndex, toRowIndex };
}

export function changeTargetSubrecordRow(fromRowIndex, toRowIndex) {
  return { 'type': CHANGE_TARGET_SUBRECORD_ROW, fromRowIndex, toRowIndex };
}

export function changeSubrecordRow(fromRowIndex, toRowIndex) {
  return { 'type': CHANGE_SUBRECORD_ROW, fromRowIndex, toRowIndex };
}

export function setSubrecordAction(rowIndex, actionType) {
  return { 'type': SET_SUBRECORD_ACTION, rowIndex, actionType };
}

export function changeSubrecordAction(rowIndex, actionType) {
  return function(dispatch) {
    dispatch(setSubrecordAction(rowIndex, actionType));
    dispatch(updateMergedSubrecord(rowIndex));
  };
}

export function updateMergedSubrecord(rowIndex) {

  return function(dispatch, getState) {

    const selectedActionType = getState().getIn(['subrecords', 'actions']).get(rowIndex);
    const preferredRecord = getState().getIn(['subrecords', 'targetRecord']).get(rowIndex);
    const otherRecord = getState().getIn(['subrecords', 'sourceRecord']).get(rowIndex);

    if (selectedActionType === SubrecordActionTypes.COPY) {
      if (preferredRecord && otherRecord) {
        throw new Error('Cannot copy both records');
      }
      
      const recordToCopy = preferredRecord || otherRecord;
      return dispatch(setMergedSubrecord(rowIndex, recordToCopy));

    }

    if (selectedActionType === SubrecordActionTypes.BLOCK) {
      return dispatch(setMergedSubrecord(rowIndex, undefined));
    }

    if (selectedActionType === SubrecordActionTypes.MERGE) {
      if (preferredRecord && otherRecord) {

        const mergeChecks = new MarcRecordMergeMelindaUtils();
        const merge = createRecordMerger(mergeConfiguration);
        
        try {
          const mergedRecord = merge(preferredRecord, otherRecord);

          mergeChecks.applyPostMergeModifications(preferredRecord, otherRecord, mergedRecord).then(fixedMergedRecord => {
            dispatch(setMergedSubrecord(rowIndex, fixedMergedRecord));
          }).catch(error => {
            dispatch(setMergedSubrecordError(rowIndex, error));
          });

        } catch(e) {
          dispatch(setMergedSubrecordError(rowIndex, e));
        }
        

      } else {
        dispatch(setMergedSubrecordError(rowIndex, new Error('Cannot merge undefined records')));
      }
    }

  };
}


export function setMergedSubrecord(rowIndex, record) {
  return { 'type': SET_MERGED_SUBRECORD, rowIndex, record };
}


export function setMergedSubrecordError(rowIndex, error) {
  return { 'type': SET_MERGED_SUBRECORD_ERROR, rowIndex, error };
}
