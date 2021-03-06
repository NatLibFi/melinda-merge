/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records in Melinda
*
* Copyright (C) 2015-2018 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-merge
*
* melinda-merge program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-merge is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import HttpStatus from 'http-status-codes';
import MarcRecord from 'marc-record-js';
import fetch from 'isomorphic-fetch';
import {exceptCoreErrors} from '../utils';
import {FetchNotOkError} from '../errors';

import {
  INSERT_SUBRECORD_ROW, REMOVE_SUBRECORD_ROW, CHANGE_SOURCE_SUBRECORD_ROW, CHANGE_TARGET_SUBRECORD_ROW,
  CHANGE_SUBRECORD_ROW, SET_SUBRECORD_ACTION, SET_EVERY_MERGED_SUBRECORD, SET_MERGED_SUBRECORD, SET_MERGED_SUBRECORD_ERROR,
  EXPAND_SUBRECORD_ROW, COMPRESS_SUBRECORD_ROW, ADD_SOURCE_SUBRECORD_FIELD, REMOVE_SOURCE_SUBRECORD_FIELD,
  UPDATE_SUBRECORD_ARRANGEMENT, EDIT_MERGED_SUBRECORD, SAVE_SUBRECORD_START, SAVE_SUBRECORD_SUCCESS, SAVE_SUBRECORD_FAILURE, SWAP_SUBRECORD_ROW, SWAP_EVERY_SUBRECORD_ROWS
} from '../constants/action-type-constants';

import {SubrecordActionTypes} from 'commons/constants';
import createRecordMerger from '@natlibfi/marc-record-merge';
import mergeConfiguration from '../config/merge-config';
import * as MergeValidation from '../marc-record-merge-validate-service';
import * as PostMerge from '../marc-record-merge-postmerge-service';
import {selectPreferredHostRecord, selectOtherHostRecord} from '../selectors/record-selectors';
import _ from 'lodash';
import {decorateFieldsWithUuid, selectRecordId, resetComponentHostLinkSubfield} from '../record-utils';

export function swapEverySubrecordRow() {
  return function (dispatch) {
    dispatch({type: SWAP_EVERY_SUBRECORD_ROWS});

    dispatch(updateEveryMergedSubrecord());
  };
}

export function swapSubrecordRow(rowId) {
  return function (dispatch) {
    dispatch({type: SWAP_SUBRECORD_ROW, rowId});

    dispatch(updateMergedSubrecord(rowId));
  };
}

export function expandSubrecordRow(rowId) {
  return {type: EXPAND_SUBRECORD_ROW, rowId};
}

export function compressSubrecordRow(rowId) {
  return {type: COMPRESS_SUBRECORD_ROW, rowId};
}

export function insertSubrecordRow(rowIndex) {
  return {'type': INSERT_SUBRECORD_ROW, rowIndex};
}

export function removeSubrecordRow(rowId) {
  return {'type': REMOVE_SUBRECORD_ROW, rowId};
}

export function changeSourceSubrecordRow(fromRowId, toRowId) {
  return {'type': CHANGE_SOURCE_SUBRECORD_ROW, fromRowId, toRowId};
}

export function changeTargetSubrecordRow(fromRowId, toRowId) {
  return {'type': CHANGE_TARGET_SUBRECORD_ROW, fromRowId, toRowId};
}

export function changeSubrecordRow(fromRowIndex, toRowIndex) {
  return {'type': CHANGE_SUBRECORD_ROW, fromRowIndex, toRowIndex};
}

export function setSubrecordAction(rowId, actionType) {
  return {'type': SET_SUBRECORD_ACTION, rowId, actionType};
}

export function setEverySubrecordAction() {
  return function (dispatch, getState) {

    const preferredHostRecordId = selectRecordId(selectPreferredHostRecord(getState()));
    const otherHostRecordId = selectRecordId(selectOtherHostRecord(getState()));

    Promise.all(getState().getIn(['subrecords', 'index']).map((rowId) => {
      const subrecordRow = getState().getIn(['subrecords', rowId]);

      const preferredRecord = subrecordRow.get('targetRecord');
      const otherRecord = subrecordRow.get('sourceRecord');
      const isSwapped = subrecordRow.get('isSwapped');

      let selectedActionType;

      if (preferredRecord && otherRecord) {
        selectedActionType = SubrecordActionTypes.MERGE;
      } else if (preferredRecord || otherRecord) {
        selectedActionType = SubrecordActionTypes.COPY;
      } else {
        selectedActionType = SubrecordActionTypes.UNSET;
      }

      return mergeSubrecord({preferredRecord, otherRecord, preferredHostRecordId, otherHostRecordId, selectedActionType, isSwapped})
        .then(record => ({rowId, record, actionType: selectedActionType}))
        .catch(error => ({rowId, error, actionType: selectedActionType}));
    })).then((rows) => dispatch(setEveryMergedSubrecord(rows.filter(row => row !== undefined))));
  };
}


export function setEveryMatchedSubrecordAction() {
  return function (dispatch, getState) {
    const preferredHostRecordId = selectRecordId(selectPreferredHostRecord(getState()));
    const otherHostRecordId = selectRecordId(selectOtherHostRecord(getState()));

    Promise.all(getState().getIn(['subrecords', 'index']).map((rowId) => {
      const subrecordRow = getState().getIn(['subrecords', rowId]);

      const preferredRecord = subrecordRow.get('targetRecord');
      const otherRecord = subrecordRow.get('sourceRecord');
      const isSwapped = subrecordRow.get('isSwapped');

      if (preferredRecord && otherRecord) {
        return mergeSubrecord({preferredRecord, otherRecord, preferredHostRecordId, otherHostRecordId, selectedActionType: SubrecordActionTypes.MERGE, isSwapped})
          .then(record => ({rowId, record}))
          .catch(error => ({rowId, error}));
      }
    })).then((rows) => dispatch(setEveryMergedSubrecord(rows.filter(row => row !== undefined), SubrecordActionTypes.MERGE)));
  };
}


export function updateSubrecordArrangement(pairs) {
  return {'type': UPDATE_SUBRECORD_ARRANGEMENT, pairs};
}

export function changeSubrecordAction(rowId, actionType) {
  return function (dispatch) {
    dispatch(setSubrecordAction(rowId, actionType));
    dispatch(updateMergedSubrecord(rowId));
  };
}

export function updateEveryMergedSubrecord() {
  return function (dispatch, getState) {
    const preferredHostRecordId = selectRecordId(selectPreferredHostRecord(getState()));
    const otherHostRecordId = selectRecordId(selectOtherHostRecord(getState()));

    Promise.all(getState().getIn(['subrecords', 'index']).map((rowId) => {
      const subrecordRow = getState().getIn(['subrecords', rowId]);

      const selectedActionType = subrecordRow.get('selectedAction');
      const preferredRecord = subrecordRow.get('targetRecord');
      const otherRecord = subrecordRow.get('sourceRecord');
      const isSwapped = subrecordRow.get('isSwapped');

      if (preferredRecord && otherRecord) {
        return mergeSubrecord({preferredRecord, otherRecord, preferredHostRecordId, otherHostRecordId, selectedActionType, isSwapped})
          .then(record => ({rowId, record, actionType: selectedActionType}))
          .catch(error => ({rowId, error, actionType: selectedActionType}));
      }
    })).then((rows) => dispatch(setEveryMergedSubrecord(rows.filter(row => row !== undefined))));
  };
}


export function updateMergedSubrecord(rowId) {
  return function (dispatch, getState) {
    const row = getState().getIn(['subrecords', rowId]);

    const selectedActionType = row.get('selectedAction');
    const preferredRecord = row.get('targetRecord');
    const otherRecord = row.get('sourceRecord');
    const isSwapped = row.get('isSwapped');

    const preferredHostRecordId = selectRecordId(selectPreferredHostRecord(getState()));
    const otherHostRecordId = selectRecordId(selectOtherHostRecord(getState()));

    return mergeSubrecord({preferredRecord, otherRecord, preferredHostRecordId, otherHostRecordId, selectedActionType, isSwapped})
      .then(record => dispatch(setMergedSubrecord(rowId, record)))
      .catch(error => dispatch(setMergedSubrecordError(rowId, error)));
  };
}

function mergeSubrecord(options) {
  const {selectedActionType, isSwapped} = options;

  const otherRecord = isSwapped ? options.preferredRecord : options.otherRecord;
  const preferredRecord = isSwapped ? options.otherRecord : options.preferredRecord;

  const preferredHostRecordId = isSwapped ? options.otherHostRecordId : options.preferredHostRecordId;
  const otherHostRecordId = isSwapped ? options.preferredHostRecordId : options.otherHostRecordId;

  if (selectedActionType === SubrecordActionTypes.COPY) {
    if (preferredRecord && otherRecord) {
      return Promise.reject(new Error('Cannot copy both records'));
    }

    let hostRecordId;
    let recordToCopy;

    if (preferredRecord) {
      hostRecordId = preferredHostRecordId;
      const postMergeFixes = _.clone(PostMerge.preset.subrecordCopyPrefer);
      const result = PostMerge.applyPostMergeModifications(postMergeFixes, preferredRecord, undefined, preferredRecord);
      recordToCopy = result.record;
    } else {
      hostRecordId = otherHostRecordId;
      const postMergeFixes = _.clone(PostMerge.preset.subrecordCopyOther);
      const result = PostMerge.applyPostMergeModifications(postMergeFixes, undefined, otherRecord, otherRecord);
      recordToCopy = result.record;
    }

    // reset 773w
    recordToCopy.fields.filter(field => {
      return field.tag === '773' && field.subfields.filter(s => s.code === 'w').some(s => s.value === `(FI-MELINDA)${hostRecordId}`);
    }).map(resetComponentHostLinkSubfield);

    return Promise.resolve(recordToCopy);
  }

  if (selectedActionType === SubrecordActionTypes.BLOCK) {
    return Promise.resolve();
  }

  if (selectedActionType === SubrecordActionTypes.UNSET || selectedActionType === undefined) {
    return Promise.resolve();
  }

  if (selectedActionType === SubrecordActionTypes.MERGE) {
    if (preferredRecord && otherRecord) {
      const componentRecordValidationRules = MergeValidation.preset.melinda_component;
      const postMergeFixes = _.clone(PostMerge.preset.defaults);

      // insert select773 just before sort
      postMergeFixes.splice(postMergeFixes.length - 1, 0, PostMerge.select773Fields(preferredHostRecordId, otherHostRecordId));

      const merge = createRecordMerger(mergeConfiguration);

      return MergeValidation.validateMergeCandidates(componentRecordValidationRules, preferredRecord, otherRecord)
        .then(() => merge(preferredRecord, otherRecord))
        .then(mergedRecord => PostMerge.applyPostMergeModifications(postMergeFixes, preferredRecord, otherRecord, mergedRecord))
        .then(result => {
          return result.record;
        }).catch(error => {
          return Promise.reject(error);
        });
    } else {
      return Promise.reject(new Error('Cannot merge undefined records'));
    }
  }
}

export function editMergedSubrecord(rowId, record) {
  return {'type': EDIT_MERGED_SUBRECORD, rowId, record};
}

export function setEveryMergedSubrecord(rows, actionType) {
  return {'type': SET_EVERY_MERGED_SUBRECORD, rows, actionType};
}

export function setMergedSubrecord(rowId, record) {
  return {'type': SET_MERGED_SUBRECORD, rowId, record};
}

export function setMergedSubrecordError(rowId, error) {
  return {'type': SET_MERGED_SUBRECORD_ERROR, rowId, error};
}

export function addSourceSubrecordField(rowId, field) {
  return {'type': ADD_SOURCE_SUBRECORD_FIELD, rowId, field};
}
export function removeSourceSubrecordField(rowId, field) {
  return {'type': REMOVE_SOURCE_SUBRECORD_FIELD, rowId, field};
}

export function toggleSourceSubrecordFieldSelection(rowId, fieldInSourceRecord) {
  return function (dispatch, getState) {

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

export const saveSubrecord = (function () {
  const APIBasePath = __DEV__ ? 'http://localhost:3001/api' : '/api';

  return function (rowId, recordId, record) {

    return function (dispatch) {

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
  return {type: SAVE_SUBRECORD_START, rowId, recordId};
}

export function saveSubrecordSuccess(rowId, record) {
  return {type: SAVE_SUBRECORD_SUCCESS, rowId, record};
}

export function saveSubrecordFailure(rowId, recordId, error) {
  return {type: SAVE_SUBRECORD_FAILURE, rowId, recordId, error};
}

function validateResponseStatus(response) {
  if (response.status !== HttpStatus.OK) {

    return response.text().then(errorReason => {
      throw new FetchNotOkError(response, errorReason);
    });
  }
  return response;
}
