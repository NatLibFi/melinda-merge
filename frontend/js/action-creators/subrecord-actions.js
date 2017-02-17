import HttpStatus from 'http-status-codes';
import MarcRecord from 'marc-record-js';
import fetch from 'isomorphic-fetch';
import { exceptCoreErrors } from '../utils';
import { FetchNotOkError } from '../errors';

import { 
  INSERT_SUBRECORD_ROW, REMOVE_SUBRECORD_ROW, CHANGE_SOURCE_SUBRECORD_ROW, CHANGE_TARGET_SUBRECORD_ROW, 
  CHANGE_SUBRECORD_ROW, SET_SUBRECORD_ACTION, SET_MERGED_SUBRECORD, SET_MERGED_SUBRECORD_ERROR, 
  EXPAND_SUBRECORD_ROW, COMPRESS_SUBRECORD_ROW, ADD_SOURCE_SUBRECORD_FIELD, REMOVE_SOURCE_SUBRECORD_FIELD,
  UPDATE_SUBRECORD_ARRANGEMENT, EDIT_MERGED_SUBRECORD, SAVE_SUBRECORD_START, SAVE_SUBRECORD_SUCCESS, SAVE_SUBRECORD_FAILURE } from '../constants/action-type-constants';

import { SubrecordActionTypes } from '../constants';
import createRecordMerger from 'marc-record-merge';
import mergeConfiguration from '../config/merge-config';
import * as MergeValidation from '../marc-record-merge-validate-service';
import * as PostMerge from '../marc-record-merge-postmerge-service';
import { selectPreferredHostRecord, selectOtherHostRecord } from '../selectors/record-selectors';
import _ from 'lodash';
import { decorateFieldsWithUuid, selectRecordId, resetRecordId, resetComponentHostLinkSubfield } from '../record-utils';

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

export function setEverySubrecordAction() {
  return function(dispatch, getState) {
    getState().getIn(['subrecords', 'index']).forEach(rowId => {
      
      const subrecordRow = getState().getIn(['subrecords', rowId]).toJS();  
      const hasSource = subrecordRow.sourceRecord !== undefined;
      const hasTarget = subrecordRow.targetRecord !== undefined;

      if (hasSource && hasTarget) {
        dispatch(setSubrecordAction(rowId, SubrecordActionTypes.MERGE));
      } else if (hasSource || hasTarget) {
        dispatch(setSubrecordAction(rowId, SubrecordActionTypes.COPY));
      } else {
        dispatch(setSubrecordAction(rowId, SubrecordActionTypes.UNSET));
      }
     
      dispatch(updateMergedSubrecord(rowId));  
    });
  };
}


export function setEveryMatchedSubrecordAction() {
  return function(dispatch, getState) {
    getState().getIn(['subrecords', 'index']).forEach(rowId => {
      
      const subrecordRow = getState().getIn(['subrecords', rowId]).toJS();  
      const hasSource = subrecordRow.sourceRecord !== undefined;
      const hasTarget = subrecordRow.targetRecord !== undefined;

      if (hasSource && hasTarget) {
        dispatch(setSubrecordAction(rowId, SubrecordActionTypes.MERGE));
        dispatch(updateMergedSubrecord(rowId));
      }
     
        
    });
  };
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

      let hostRecordId;
      let recordToCopy;

      if (preferredRecord) {
        hostRecordId = selectRecordId(selectPreferredHostRecord(getState()));
        recordToCopy = new MarcRecord(preferredRecord);
      } else {
        hostRecordId = selectRecordId(selectOtherHostRecord(getState()));
        recordToCopy = new MarcRecord(otherRecord);
      }

      // reset 001      
      resetRecordId(recordToCopy);

      // reset 773w
      recordToCopy.fields.filter(field => {
        return field.tag === '773' && field.subfields.filter(s => s.code === 'w').some(s => s.value === `(FI-MELINDA)${hostRecordId}`);
      }).map(resetComponentHostLinkSubfield);

      // Note: We don't handle LOW/SID tags when subrecord action=COPY. 
      // LOW-SYNC will handle that after the record has been added to melinda.
      return dispatch(setMergedSubrecord(rowId, recordToCopy));

    }

    if (selectedActionType === SubrecordActionTypes.BLOCK) {
      return dispatch(setMergedSubrecord(rowId, undefined));
    }

    if (selectedActionType === SubrecordActionTypes.UNSET || selectedActionType === undefined) {
      return dispatch(setMergedSubrecord(rowId, undefined));
    }

    if (selectedActionType === SubrecordActionTypes.MERGE) {
      if (preferredRecord && otherRecord) {

        const preferredHostRecordId = selectRecordId(selectPreferredHostRecord(getState()));
        const otherHostRecordId = selectRecordId(selectOtherHostRecord(getState()));


        const componentRecordValidationRules = MergeValidation.preset.melinda_component;
        const postMergeFixes = _.clone(PostMerge.preset.defaults);

        // insert select773 just before sort
        postMergeFixes.splice(postMergeFixes.length-1, 0, PostMerge.select773Fields(preferredHostRecordId, otherHostRecordId));

        const merge = createRecordMerger(mergeConfiguration);

        MergeValidation.validateMergeCandidates(componentRecordValidationRules, preferredRecord, otherRecord)
          .then(() => merge(preferredRecord, otherRecord))
          .then(mergedRecord => PostMerge.applyPostMergeModifications(postMergeFixes, preferredRecord, otherRecord, mergedRecord))
          .then(result => {
            const fixedMergedRecord = result.record;
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

export function editMergedSubrecord(rowId, record) {
  return { 'type': EDIT_MERGED_SUBRECORD, rowId, record };
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

export const saveSubrecord = (function() {
  const APIBasePath = __DEV__ ? 'http://localhost:3001/api': '/api';
  
  return function(rowId, recordId, record) {

    return function(dispatch) {

      dispatch(saveSubrecordStart(rowId, recordId));
      
      const fetchOptions = {
        method: 'PUT',
        body: JSON.stringify({ 
          record: record
        }),
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
        credentials: 'include'
      };

      return fetch(`${APIBasePath}/${recordId}`, fetchOptions)
        .then(validateResponseStatus)
        .then(response => response.json())
        .then(json => {

          const marcRecord = new MarcRecord(json.record);
          decorateFieldsWithUuid(marcRecord);
         
          dispatch(saveSubrecordSuccess(rowId, marcRecord));
   
        }).catch(exceptCoreErrors((error) => {

          if (error instanceof FetchNotOkError) {
            switch (error.response.status) {
              case HttpStatus.BAD_REQUEST: return dispatch(saveSubrecordFailure(rowId, recordId, new Error(error.message)));
              case HttpStatus.NOT_FOUND: return dispatch(saveSubrecordFailure(rowId, recordId, new Error('Tietuetta ei löytynyt')));
              case HttpStatus.INTERNAL_SERVER_ERROR: return dispatch(saveSubrecordFailure(rowId, recordId, new Error('Tietueen tallentamisessa tapahtui virhe.')));
            }
          }

          dispatch(saveSubrecordFailure(rowId, recordId, new Error('There has been a problem with fetch operation: ' + error.message)));

        }));
    };
  };
})();

export function saveSubrecordStart(rowId, recordId) {
  return { type: SAVE_SUBRECORD_START, rowId, recordId};
}

export function saveSubrecordSuccess(rowId, record) {
  return { type: SAVE_SUBRECORD_SUCCESS, rowId, record};
}

export function saveSubrecordFailure(rowId, recordId, error) {
  return { type: SAVE_SUBRECORD_FAILURE, rowId, recordId, error };
}

function validateResponseStatus(response) {
  if (response.status !== HttpStatus.OK) {

    return response.text().then(errorReason => {
      throw new FetchNotOkError(response, errorReason);
    });
  }
  return response;
}
