/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records
*
* Copyright (C) 2015-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of marc-merge-ui
*
* marc-merge-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* oai-pmh-server-backend-module-melinda is distributed in the hope that it will be useful,
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

import fetch from 'isomorphic-fetch';
import MarcRecord from 'marc-record-js';
import HttpStatus from 'http-status-codes';
import _ from 'lodash';
import createRecordMerger from 'marc-record-merge';
import mergeConfiguration from './config/merge-config';
import { exceptCoreErrors } from './utils';
import {hashHistory} from 'react-router';
import { markAsMerged } from './action-creators/duplicate-database-actions';
import { RESET_WORKSPACE, TOGGLE_COMPACT_SUBRECORD_VIEW } from './constants/action-type-constants';
import { FetchNotOkError } from './errors';
import { subrecordRows, sourceSubrecords, targetSubrecords, rowsWithResultRecord } from './selectors/subrecord-selectors';
import { updateSubrecordArrangement, saveSubrecordSuccess } from './action-creators/subrecord-actions';
import { match } from './component-record-match-service';
import { decorateFieldsWithUuid } from './record-utils';

import * as MergeValidation from './marc-record-merge-validate-service';
import * as PostMerge from './marc-record-merge-postmerge-service';

export function commitMerge() {

  const APIBasePath = __DEV__ ? 'http://localhost:3001/merge': '/merge';

  return function(dispatch, getState) {
    dispatch(commitMergeStart());

    const sourceRecord = getState().getIn(['sourceRecord', 'record']);
    const targetRecord = getState().getIn(['targetRecord', 'record']);
    const mergedRecord = getState().getIn(['mergedRecord', 'record']);
    const unmodifiedRecord = getState().getIn(['mergedRecord', 'unmodifiedRecord']);

    const subrecords = subrecordRows(getState());
    const sourceSubrecordList = _(subrecords).map('sourceRecord').compact().value();
    const targetSubrecordList = _(subrecords).map('targetRecord').compact().value();
    const mergedSubrecordList = _(subrecords).map('mergedRecord').compact().value();
    const unmodifiedMergedSubrecordList = _(subrecords).map('unmodifiedMergedRecord').compact().value();


    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify({ 
        otherRecord: {
          record: sourceRecord,
          subrecords: sourceSubrecordList,
        },
        preferredRecord: {
          record: targetRecord,
          subrecords: targetSubrecordList,
        },
        mergedRecord: {
          record: mergedRecord,
          subrecords: mergedSubrecordList
        },
        unmodifiedRecord: {
          record: unmodifiedRecord,
          subrecords: unmodifiedMergedSubrecordList
        }
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      credentials: 'include'
    };

    return fetch(`${APIBasePath}/commit-merge`, fetchOptions)
      .then(response => {

        response.json().then(res => {
          if (response.status == HttpStatus.OK) {

            const newMergedRecordId = res.recordId;

            const { record, subrecords } = marcRecordsFrom(res.record, res.subrecords);
          
            dispatch(commitMergeSuccess(newMergedRecordId, res));
            dispatch(saveRecordSuccess(record));

            // subrecords            
            const rowIds = rowsWithResultRecord(getState()).map(row => row.rowId);
            _.zip(rowIds, subrecords).forEach(([rowId, subrecord]) => {
              dispatch(saveSubrecordSuccess(rowId, subrecord));
            });

            dispatch(markAsMerged());
         
          } else {
            switch (response.status) {
              case HttpStatus.UNAUTHORIZED: return dispatch(commitMergeError('Käyttäjätunnus ja salasana eivät täsmää.'));
              case HttpStatus.INTERNAL_SERVER_ERROR: return dispatch(commitMergeError('Tietueen tallennuksessa tapahtui virhe.', res));
            }

            dispatch(commitMergeError('Tietueen tallennuksessa tapahtui virhe.', res));
          }
        });

      }).catch((error) => {
        dispatch(commitMergeError('There has been a problem with operation: ' + error.message));
      });

  };
}

export const COMMIT_MERGE_START = 'COMMIT_MERGE_START';

export function commitMergeStart() {
  return {
    type: COMMIT_MERGE_START
  };
}

export const COMMIT_MERGE_ERROR = 'COMMIT_MERGE_ERROR';

export function commitMergeError(errorMessage, response) {
  return {
    type: COMMIT_MERGE_ERROR,
    error: errorMessage,
    response
  };
}

export const COMMIT_MERGE_SUCCESS = 'COMMIT_MERGE_SUCCESS';

export function commitMergeSuccess(recordId, response) {
  return {
    type: COMMIT_MERGE_SUCCESS,
    recordId: recordId,
    response: response
  };
}

export const CLOSE_MERGE_DIALOG = 'CLOSE_MERGE_DIALOG';

export function closeMergeDialog() {
  return {
    type: CLOSE_MERGE_DIALOG
  };
}

export const RESET_STATE = 'RESET_STATE';
export function resetState() {
  return {
    type: RESET_STATE,
  };
}


export function resetWorkspace() {
  
  hashHistory.push('/');

  return {
    type: RESET_WORKSPACE,
  };
}


export function locationDidChange(location) {
  return function(dispatch, getState) {

    dispatch(setLocation(location));

    const match = _.get(location, 'pathname', '').match('/records/(\\d+)/and/(\\d+)$');
    if (match !== null) {
      const [, nextOtherId, nextPreferredId] = match;

      const currentPreferredId = getState().getIn(['targetRecord', 'id']);
      const currentOtherId = getState().getIn(['sourceRecord', 'id']);

      if (nextOtherId !== currentOtherId) {
        dispatch(fetchRecord(nextOtherId, 'SOURCE'));
        dispatch(setSourceRecordId(nextOtherId));
      }

      if (nextPreferredId !== currentPreferredId) {
        dispatch(fetchRecord(nextPreferredId, 'TARGET'));
        dispatch(setTargetRecordId(nextPreferredId));
      }
    }
  };
}

export const SAVE_RECORD_SUCCESS = 'SAVE_RECORD_SUCCESS';

export function saveRecordSuccess(record) {
  return { type: SAVE_RECORD_SUCCESS, record};
}

export const SET_LOCATION = 'SET_LOCATION';

export function setLocation(location) {
  return {
    type: SET_LOCATION,
    location: location
  };
}

export const LOAD_SOURCE_RECORD = 'LOAD_SOURCE_RECORD';

export function loadSourceRecord(recordId) {
  return {
    type: LOAD_SOURCE_RECORD,
    id: recordId
  };
}

export const SET_SOURCE_RECORD = 'SET_SOURCE_RECORD';

export function setSourceRecord(record, subrecords, recordId) {
  return {
    'type': SET_SOURCE_RECORD,
    'record': record,
    'subrecords': subrecords,
    recordId
  };
}

export const LOAD_TARGET_RECORD = 'LOAD_TARGET_RECORD';

export function loadTargetRecord(recordId) {
  return {
    type: LOAD_TARGET_RECORD,
    id: recordId
  };
}

export const SET_TARGET_RECORD = 'SET_TARGET_RECORD';

export function setTargetRecord(record, subrecords, recordId) {
  return {
    'type': SET_TARGET_RECORD,
    'record': record,
    'subrecords': subrecords,
    recordId
  };
}

export const SET_TARGET_RECORD_ERROR = 'SET_TARGET_RECORD_ERROR';

export function setTargetRecordError(error) {
  return {
    'type': SET_TARGET_RECORD_ERROR,
    'error': error
  };
}

export const SET_SOURCE_RECORD_ERROR = 'SET_SOURCE_RECORD_ERROR';

export function setSourceRecordError(error) {
  return {
    'type': SET_SOURCE_RECORD_ERROR,
    'error': error
  };
}

export const SWAP_RECORDS = 'SWAP_RECORDS';

export function swapRecords() {

  return function(dispatch, getState) {
    const sourceRecordId = getState().getIn(['sourceRecord', 'id']);
    const targetRecordId = getState().getIn(['targetRecord', 'id']);
    dispatch(fetchRecord(sourceRecordId, 'TARGET'));
    dispatch(fetchRecord(targetRecordId, 'SOURCE'));
  };

}

export const SET_SOURCE_RECORD_ID = 'SET_SOURCE_RECORD_ID';

export function setSourceRecordId(recordId) {
  return { 'type': SET_SOURCE_RECORD_ID, 'recordId': recordId };
}


export const SET_TARGET_RECORD_ID = 'SET_TARGET_RECORD_ID';

export function setTargetRecordId(recordId) {
  return { 'type': SET_TARGET_RECORD_ID, 'recordId': recordId };
}

export function updateMergedRecord() {

  return function(dispatch, getState) {

    const preferredRecord = getState().getIn(['targetRecord', 'record']);
    const otherRecord = getState().getIn(['sourceRecord', 'record']);
    
    if (preferredRecord && otherRecord) {

      const validationRules = MergeValidation.preset.melinda_host;
      const postMergeFixes = PostMerge.preset.defaults;

      const merge = createRecordMerger(mergeConfiguration);

      MergeValidation.validateMergeCandidates(validationRules, preferredRecord, otherRecord)
        .then(() => merge(preferredRecord, otherRecord))
        .then(mergedRecord => PostMerge.applyPostMergeModifications(postMergeFixes, preferredRecord, otherRecord, mergedRecord))
        .then(result => {
          dispatch(setMergedRecord(result.record));
        })
        .catch(exceptCoreErrors(error => {
          dispatch(setMergedRecordError(error));
        }));


      // find pairs for subrecods
      const sourceSubrecordList = sourceSubrecords(getState());
      const targetSubrecordList = targetSubrecords(getState());

      const matchedSubrecordPairs = match(sourceSubrecordList, targetSubrecordList);
      dispatch(updateSubrecordArrangement(matchedSubrecordPairs));

    }
  };
}

export const SET_MERGED_RECORD = 'SET_MERGED_RECORD';

export function setMergedRecord(record) {
  return {
    'type': SET_MERGED_RECORD,
    'record': record
  };
}

export const EDIT_MERGED_RECORD = 'EDIT_MERGED_RECORD';

export function editMergedRecord(record) {
  return {
    'type': EDIT_MERGED_RECORD,
    'record': record
  };
}

export const SET_MERGED_RECORD_ERROR = 'SET_MERGED_RECORD_ERROR';

export function setMergedRecordError(error) {
  return {
    'type': SET_MERGED_RECORD_ERROR,
    'error': error
  };
}


export const CLEAR_MERGED_RECORD = 'CLEAR_MERGED_RECORD';

export function clearMergedRecord() {
  return {
    'type': CLEAR_MERGED_RECORD
  };
}

export const fetchRecord = (function() {

  const APIBasePath = __DEV__ ? 'http://localhost:3001/api': '/api';

  const fetchSourceRecord = recordFetch(APIBasePath, loadSourceRecord, setSourceRecord, setSourceRecordError);
  const fetchTargetRecord = recordFetch(APIBasePath, loadTargetRecord, setTargetRecord, setTargetRecordError);

  return function(recordId, type) {

    return function (dispatch) {

      if (type !== 'SOURCE' && type !== 'TARGET') {
        throw new Error('fetchRecord type parameter must be either SOURCE or TARGET');
      }

      if (type === 'SOURCE') {
        return fetchSourceRecord(recordId, dispatch);
      }

      if (type === 'TARGET') {
        return fetchTargetRecord(recordId, dispatch);
      }
    };

  };
 
})();

function recordFetch(APIBasePath, loadRecordAction, setRecordAction, setRecordErrorAction) {
  let currentRecordId;
  return function(recordId, dispatch) {
    currentRecordId = recordId;
    
    dispatch(loadRecordAction(recordId));

    return fetch(`${APIBasePath}/${recordId}`)
      .then(validateResponseStatus)
      .then(response => response.json())
      .then(json => {


        if (currentRecordId === recordId) {

          const {record, subrecords} = marcRecordsFrom(json.record, json.subrecords);

          dispatch(setRecordAction(record, subrecords, recordId));
          dispatch(updateMergedRecord());
        }
 
      }).catch(exceptCoreErrors((error) => {

        if (error instanceof FetchNotOkError) {
          switch (error.response.status) {
            case HttpStatus.NOT_FOUND: return dispatch(setRecordErrorAction('Tietuetta ei löytynyt'));
            case HttpStatus.INTERNAL_SERVER_ERROR: return dispatch(setRecordErrorAction('Tietueen lataamisessa tapahtui virhe.'));
          }
        }
                
        dispatch(setRecordErrorAction('There has been a problem with fetch operation: ' + error.message));
      }));
  };
}

function marcRecordsFrom(record, subrecords) {
  const marcRecord = new MarcRecord(record);
  const marcSubrecords = subrecords.map(record => new MarcRecord(record));
         
  decorateFieldsWithUuid(marcRecord);
  marcSubrecords.forEach(decorateFieldsWithUuid);

  return {
    record: marcRecord,
    subrecords: marcSubrecords
  };
}

function validateResponseStatus(response) {
  if (response.status !== HttpStatus.OK) {
    throw new FetchNotOkError(response);
  }
  return response;
}

export const ADD_SOURCE_RECORD_FIELD = 'ADD_SOURCE_RECORD_FIELD';
export const REMOVE_SOURCE_RECORD_FIELD = 'REMOVE_SOURCE_RECORD_FIELD';

export function addSourceRecordField(field) {
  return { 'type': ADD_SOURCE_RECORD_FIELD, field};
}
export function removeSourceRecordField(field) {
  return { 'type': REMOVE_SOURCE_RECORD_FIELD, field};
}

export function toggleSourceRecordFieldSelection(fieldInSourceRecord) {
  return function(dispatch, getState) {
    const mergedRecord = getState().getIn(['mergedRecord', 'record']);
    const field = mergedRecord.fields.find(fieldInMergedRecord => fieldInMergedRecord.uuid === fieldInSourceRecord.uuid);

    if (field === undefined) {
      dispatch(addSourceRecordField(fieldInSourceRecord));
    } else {
      dispatch(removeSourceRecordField(fieldInSourceRecord));
    }

  };
}

export function setCompactSubrecordView(enabled) {
  return function(dispatch, getState) {

    const rowsToCompact = rowsWithResultRecord(getState()).map(row => row.rowId);

    dispatch({ 'type': TOGGLE_COMPACT_SUBRECORD_VIEW, enabled, rowsToCompact});
  };
}
