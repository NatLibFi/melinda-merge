import fetch from 'isomorphic-fetch';
import MARCRecord from 'marc-record-js';
import HttpStatus from 'http-status-codes';
import * as Cookies from 'js-cookie';
import _ from 'lodash';
import MarcRecordMergeMelindaUtils from './vendor/marc-record-merge-melindautils';
import createRecordMerger from 'marc-record-merge';
import mergeConfiguration from './config/merge-config';
import { exceptCoreErrors } from './utils';
import {hashHistory} from 'react-router';
import { markAsMerged } from './action-creators/duplicate-database-actions';
import { RESET_WORKSPACE } from './constants/action-type-constants';
import { SubrecordActionTypes } from './constants';
import { FetchNotOkError } from './errors';

export function commitMerge() {

  const APIBasePath = __DEV__ ? 'http://localhost:3001/api': '/api';

  return function(dispatch, getState) {
    dispatch(commitMergeStart());

    const sourceRecord = getState().getIn(['sourceRecord', 'record']);
    const targetRecord = getState().getIn(['targetRecord', 'record']);
    const mergedRecord = getState().getIn(['mergedRecord', 'record']);

    const sourceSubrecordList = getState().getIn(['subrecords', 'sourceRecord']).filter(_.identity);
    const targetSubrecordList = getState().getIn(['subrecords', 'targetRecord']).filter(_.identity);
    const mergedSubrecordList = getState().getIn(['subrecords', 'mergedRecord']).filter(_.identity);

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
            dispatch(commitMergeSuccess(newMergedRecordId, res));
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

export function setSourceRecord(record, subrecords) {
  return {
    'type': SET_SOURCE_RECORD,
    'record': record,
    'subrecords': subrecords
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

export function setTargetRecord(record, subrecords) {
  return {
    'type': SET_TARGET_RECORD,
    'record': record,
    'subrecords': subrecords
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
      const mergeChecks = new MarcRecordMergeMelindaUtils();
      const merge = createRecordMerger(mergeConfiguration);

      mergeChecks.canMerge(preferredRecord, otherRecord)
        .then(() => merge(preferredRecord, otherRecord))
        .then(mergedRecord => mergeChecks.applyPostMergeModifications(preferredRecord, otherRecord, mergedRecord))
        .then(mergedRecord => dispatch(setMergedRecord(mergedRecord)))
        .catch(error => {
          dispatch(setMergedRecordError(error.message));
        }).done();

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


export const CREATE_SESSION_START = 'CREATE_SESSION_START';

export function createSessionStart() {
  return { 'type': CREATE_SESSION_START };
}


export const CREATE_SESSION_ERROR = 'CREATE_SESSION_ERROR';

export function createSessionError(message) {
  return { 'type': CREATE_SESSION_ERROR, message};
}


export const CREATE_SESSION_SUCCESS = 'CREATE_SESSION_SUCCESS';

export function createSessionSuccess(userinfo) {
  return { 'type': CREATE_SESSION_SUCCESS, userinfo };
}

export const VALIDATE_SESSION = 'VALIDATE_SESSION';

export function validateSession(sessionToken) {
  const sessionBasePath = __DEV__ ? 'http://localhost:3001/session': '/session';

  return function(dispatch) {

    if (sessionToken === undefined) {
      return;
    }

    dispatch(validateSessionStart());

    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify({ sessionToken }),
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
    };

    return fetch(`${sessionBasePath}/validate`, fetchOptions)
      .then(response => {
        if (response.status == HttpStatus.OK) {

          const username = _.head(sessionToken.split(':'));

          dispatch(createSessionSuccess({username}));

        } else {
          Cookies.remove('sessionToken');
        }
      });
  };
}

export const VALIDATE_SESSION_START = 'VALIDATE_SESSION_START';

export function validateSessionStart() {
  return { 'type': VALIDATE_SESSION_START };
}

export function removeSession() {
  return function(dispatch) {
    Cookies.remove('sessionToken');
    dispatch(resetState());
  };
}

export const startSession = (function() {
  const sessionBasePath = __DEV__ ? 'http://localhost:3001/session': '/session';

  return function(username, password) {

    return function(dispatch) {

      dispatch(createSessionStart());

      const fetchOptions = {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
      };

      return fetch(`${sessionBasePath}/start`, fetchOptions)
        .then(response => {

          if (response.status == HttpStatus.OK) {

            return response.json().then(json => {

              const sessionToken = json.sessionToken;

              Cookies.set('sessionToken', sessionToken);
              dispatch(createSessionSuccess({username}));
            });

          } else {
            switch (response.status) {
            case HttpStatus.BAD_REQUEST: return dispatch(createSessionError('Syötä käyttäjätunnus ja salasana'));
            case HttpStatus.UNAUTHORIZED: return dispatch(createSessionError('Käyttäjätunnus ja salasana eivät täsmää'));
            case HttpStatus.INTERNAL_SERVER_ERROR: return dispatch(createSessionError('Käyttäjätunnuksen tarkastuksessa tapahtui virhe. Yritä hetken päästä uudestaan.'));
            }

            dispatch(createSessionError('Käyttäjätunnuksen tarkastuksessa tapahtui virhe. Yritä hetken päästä uudestaan.'));
            
          }

        }).catch(exceptCoreErrors((error) => {
          dispatch(createSessionError('There has been a problem with operation: ' + error.message));
        }));

    };

  };
})();

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

if (__DEV__) {
  window.fetchRecord = fetchRecord;
}

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
          const mainRecord = json.record;
          const subrecords = json.subrecords;

          const marcRecord = new MARCRecord(mainRecord);
          const marcSubRecords = subrecords.map(record => new MARCRecord(record));


          dispatch(setRecordAction(marcRecord, marcSubRecords));
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

function validateResponseStatus(response) {
  if (response.status !== HttpStatus.OK) {
    throw new FetchNotOkError(response);
  }
  return response;
}

export const INSERT_SUBRECORD_ROW = 'INSERT_SUBRECORD_ROW';

export function insertSubrecordRow(rowIndex) {
  return { 'type': INSERT_SUBRECORD_ROW, rowIndex };
}

export const REMOVE_SUBRECORD_ROW = 'REMOVE_SUBRECORD_ROW';

export function removeSubrecordRow(rowIndex) {
  return { 'type': REMOVE_SUBRECORD_ROW, rowIndex };
}

export const CHANGE_SOURCE_SUBRECORD_ROW = 'CHANGE_SOURCE_SUBRECORD_ROW';
export const CHANGE_TARGET_SUBRECORD_ROW = 'CHANGE_TARGET_SUBRECORD_ROW';

export function changeSourceSubrecordRow(fromRowIndex, toRowIndex) {
  return { 'type': CHANGE_SOURCE_SUBRECORD_ROW, fromRowIndex, toRowIndex };
}

export function changeTargetSubrecordRow(fromRowIndex, toRowIndex) {
  return { 'type': CHANGE_TARGET_SUBRECORD_ROW, fromRowIndex, toRowIndex };
}

export const CHANGE_SUBRECORD_ROW = 'CHANGE_SUBRECORD_ROW';
export function changeSubrecordRow(fromRowIndex, toRowIndex) {
  return { 'type': CHANGE_SUBRECORD_ROW, fromRowIndex, toRowIndex };
}


export const SET_SUBRECORD_ACTION = 'SET_SUBRECORD_ACTION';

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

        const merge = createRecordMerger(mergeConfiguration);

        try {
          const mergedRecord = merge(preferredRecord, otherRecord);
          dispatch(setMergedSubrecord(rowIndex, mergedRecord));
        } catch(e) {
          dispatch(setMergedSubrecordError(rowIndex, e));
        }
        

      } else {
        dispatch(setMergedSubrecordError(rowIndex, new Error('Cannot merge undefined records')));
      }
    }

  };
}

export const SET_MERGED_SUBRECORD = 'SET_MERGED_SUBRECORD';

export function setMergedSubrecord(rowIndex, record) {
  return { 'type': SET_MERGED_SUBRECORD, rowIndex, record };
}

export const SET_MERGED_SUBRECORD_ERROR = 'SET_MERGED_SUBRECORD_ERROR';

export function setMergedSubrecordError(rowIndex, error) {
  return { 'type': SET_MERGED_SUBRECORD_ERROR, rowIndex, error };
}
