import fetch from 'isomorphic-fetch';
import MARCRecord from 'marc-record-js';
import HttpStatus from 'http-status-codes';
import * as Cookies from 'js-cookie';
import _ from 'lodash';
import MarcRecordMergeMelindaUtils from './vendor/marc-record-merge-melindautils';
import createRecordMerger from 'marc-record-merge';
import mergeConfiguration from './config/merge-config';
import { exceptCoreErrors } from './utils';
import { SubrecordActionTypes } from './constants';

export const RESET_STATE = 'RESET_STATE';
export function resetState() {
  return {
    type: RESET_STATE,
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
  let currentSourceRecordId;
  let currentTargetRecordId;

  const APIBasePath = __DEV__ ? 'http://localhost:3001/api': '/api';

  return function(recordId, type) {

    return function (dispatch) {

      if (type !== 'SOURCE' && type !== 'TARGET') {
        throw new Error('fetchRecord type parameter must be either SOURCE or TARGET');
      }

      if (type === 'SOURCE') {
        dispatch(loadSourceRecord(recordId));
        currentSourceRecordId = recordId;

        return fetch(`${APIBasePath}/${recordId}`)
          .then(response => {

            if (response.status == HttpStatus.OK) {

              return response.json().then(json => {
                
                if (currentSourceRecordId === recordId) {
                  const mainRecord = json.record;
                  const subrecords = json.subrecords;

                  const marcRecord = new MARCRecord(mainRecord);
                  const marcSubRecords = subrecords.map(record => new MARCRecord(record));

                  dispatch(setSourceRecord(marcRecord, marcSubRecords));
                  dispatch(updateMergedRecord());
                }
              });
            } else {
              dispatch(setSourceRecordError('There has been a problem with fetch operation: ' + response.status));
            }
       
          }).catch(exceptCoreErrors((error) => {
            dispatch(setSourceRecordError('There has been a problem with fetch operation: ' + error.message));
          }));

      }

      if (type === 'TARGET') {
        dispatch(loadTargetRecord(recordId));
        currentTargetRecordId = recordId;

        return fetch(`${APIBasePath}/${recordId}`)
          .then(response => {

            if (response.status == HttpStatus.OK) {

              response.json().then(json => {

                if (currentTargetRecordId === recordId) {
                  const mainRecord = json.record;
                  const subrecords = json.subrecords;

                  const marcRecord = new MARCRecord(mainRecord);
                  const marcSubRecords = subrecords.map(record => new MARCRecord(record));

                  dispatch(setTargetRecord(marcRecord, marcSubRecords));
                  dispatch(updateMergedRecord());
                }
              });
            } else {
              dispatch(setTargetRecordError('There has been a problem with fetch operation: ' + response.status));
            }
       
          }).catch(exceptCoreErrors((error) => {
            dispatch(setTargetRecordError('There has been a problem with fetch operation: ' + error.message));
          }));

      }
    };

  };
})();

if (__DEV__) {
  window.fetchRecord = fetchRecord;
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

    const selectedActionType = getState().get('subrecordActions').get(rowIndex);

    const preferredRecord = getState().getIn(['targetRecord', 'subrecords']).get(rowIndex);
    const otherRecord = getState().getIn(['sourceRecord', 'subrecords']).get(rowIndex);

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
