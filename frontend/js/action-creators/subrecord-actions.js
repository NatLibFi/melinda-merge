import { 
  INSERT_SUBRECORD_ROW, REMOVE_SUBRECORD_ROW, CHANGE_SOURCE_SUBRECORD_ROW, CHANGE_TARGET_SUBRECORD_ROW, 
  CHANGE_SUBRECORD_ROW, SET_SUBRECORD_ACTION, SET_MERGED_SUBRECORD, SET_MERGED_SUBRECORD_ERROR, 
  EXPAND_SUBRECORD_ROW, COMPRESS_SUBRECORD_ROW, ADD_SOURCE_SUBRECORD_FIELD, REMOVE_SOURCE_SUBRECORD_FIELD,
  UPDATE_SUBRECORD_ARRANGEMENT } from '../constants/action-type-constants';

import { SubrecordActionTypes } from '../constants';
import createRecordMerger from 'marc-record-merge';
import mergeConfiguration from '../config/merge-config';
import * as MergeValidation from '../marc-record-merge-validate-service';
import * as PostMerge from '../marc-record-merge-postmerge-service';

export function expandSubrecordRow(rowId) {
  return { type: EXPAND_SUBRECORD_ROW, rowId };
}

export function compressSubrecordRow(rowId) {
  return { type: COMPRESS_SUBRECORD_ROW, rowId };
}

export function insertSubrecordRow(rowIndex) {
  return { 'type': INSERT_SUBRECORD_ROW, rowIndex };
}

export function removeSubrecordRow(rowId) {
  return { 'type': REMOVE_SUBRECORD_ROW, rowId };
}

export function changeSourceSubrecordRow(fromRowId, toRowId) {
  return { 'type': CHANGE_SOURCE_SUBRECORD_ROW, fromRowId, toRowId };
}

export function changeTargetSubrecordRow(fromRowId, toRowId) {
  return { 'type': CHANGE_TARGET_SUBRECORD_ROW, fromRowId, toRowId };
}

export function changeSubrecordRow(fromRowIndex, toRowIndex) {
  return { 'type': CHANGE_SUBRECORD_ROW, fromRowIndex, toRowIndex };
}

export function setSubrecordAction(rowId, actionType) {
  return { 'type': SET_SUBRECORD_ACTION, rowId, actionType };
}

export function updateSubrecordArrangement(pairs) {
  return { 'type': UPDATE_SUBRECORD_ARRANGEMENT, pairs };
}

export function changeSubrecordAction(rowId, actionType) {
  return function(dispatch) {
    dispatch(setSubrecordAction(rowId, actionType));
    dispatch(updateMergedSubrecord(rowId));
  };
}

export function updateMergedSubrecord(rowId) {

  return function(dispatch, getState) {

    const row = getState().getIn(['subrecords', rowId]);

    const selectedActionType = row.get('selectedAction');
    const preferredRecord = row.get('targetRecord');
    const otherRecord = row.get('sourceRecord');

    if (selectedActionType === SubrecordActionTypes.COPY) {
      if (preferredRecord && otherRecord) {
        throw new Error('Cannot copy both records');
      }
      
      const recordToCopy = preferredRecord || otherRecord;
      return dispatch(setMergedSubrecord(rowId, recordToCopy));

    }

    if (selectedActionType === SubrecordActionTypes.BLOCK) {
      return dispatch(setMergedSubrecord(rowId, undefined));
    }

    if (selectedActionType === SubrecordActionTypes.MERGE) {
      if (preferredRecord && otherRecord) {


        const componentRecordValidationRules = MergeValidation.preset.melinda_component;
        const postMergeFixes = PostMerge.preset.defaults;

        const merge = createRecordMerger(mergeConfiguration);

        MergeValidation.validateMergeCandidates(componentRecordValidationRules, preferredRecord, otherRecord)
          .then(() => merge(preferredRecord, otherRecord))
          .then(mergedRecord => PostMerge.applyPostMergeModifications(postMergeFixes, preferredRecord, otherRecord, mergedRecord))
          .then(fixedMergedRecord => {
            dispatch(setMergedSubrecord(rowId, fixedMergedRecord));
          }).catch(error => {
            dispatch(setMergedSubrecordError(rowId, error));
          });

      } else {
        dispatch(setMergedSubrecordError(rowId, new Error('Cannot merge undefined records')));
      }
    }

  };
}

export function setMergedSubrecord(rowId, record) {
  return { 'type': SET_MERGED_SUBRECORD, rowId, record };
}

export function setMergedSubrecordError(rowId, error) {
  return { 'type': SET_MERGED_SUBRECORD_ERROR, rowId, error };
}

export function addSourceSubrecordField(rowId, field) {
  return { 'type': ADD_SOURCE_SUBRECORD_FIELD, rowId, field};
}
export function removeSourceSubrecordField(rowId, field) {
  return { 'type': REMOVE_SOURCE_SUBRECORD_FIELD, rowId, field};
}

export function toggleSourceSubrecordFieldSelection(rowId, fieldInSourceRecord) {
  return function(dispatch, getState) {

    const row = getState().getIn(['subrecords', rowId]);
    const mergedRecord = row.get('mergedRecord');

    const field = mergedRecord.fields.find(fieldInMergedRecord => fieldInMergedRecord.uuid === fieldInSourceRecord.uuid);

    if (field === undefined) {
      dispatch(addSourceSubrecordField(rowId, fieldInSourceRecord));
    } else {
      dispatch(removeSourceSubrecordField(rowId, fieldInSourceRecord));
    }

  };
}
