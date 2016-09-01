import fetch from 'isomorphic-fetch';
import MARCRecord from 'marc-record-js';
import MarcRecordMergeMelindaUtils from './vendor/marc-record-merge-melindautils';
import createRecordMerger from 'marc-record-merge';
import mergeConfiguration from './config/merge-config';


export const LOAD_SOURCE_RECORD = 'LOAD_SOURCE_RECORD';

export function loadSourceRecord(recordId) {
  return {
    type: LOAD_SOURCE_RECORD,
    id: recordId
  };
}

export const SET_SOURCE_RECORD = 'SET_SOURCE_RECORD';

export function setSourceRecord(record) {
  return {
    'type': SET_SOURCE_RECORD,
    'record': record
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

export function setTargetRecord(record) {
  return {
    'type': SET_TARGET_RECORD,
    'record': record
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

export function startSessionError(message) {
  return { 'type': CREATE_SESSION_ERROR, message};
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

          if (response.status == 200) {

            return response.json().then(json => {

              const sessionToken = json.sessionToken;
              window.sessionToken = sessionToken;
            });

          } else {
            dispatch(startSessionError('There has been a problem with operation: ' + response.status));
          }

        }).catch((error) => {
          dispatch(startSessionError('There has been a problem with operation: ' + error.message));
        });

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

            if (response.status == 200) {

              return response.json().then(json => {
                
                if (currentSourceRecordId === recordId) {
                  const marcRecord = new MARCRecord(json);
                  dispatch(setSourceRecord(marcRecord));
                  dispatch(updateMergedRecord());
                }
              });
            } else {
              dispatch(setSourceRecordError('There has been a problem with fetch operation: ' + response.status));
            }
       
          }).catch((error) => {
            dispatch(setSourceRecordError('There has been a problem with fetch operation: ' + error.message));
          });

      }

      if (type === 'TARGET') {
        dispatch(loadTargetRecord(recordId));
        currentTargetRecordId = recordId;

        return fetch(`${APIBasePath}/${recordId}`)
          .then(response => {

            if (response.status == 200) {

              response.json().then(json => {

                if (currentTargetRecordId === recordId) {
                  const marcRecord = new MARCRecord(json);
                  dispatch(setTargetRecord(marcRecord));
                  dispatch(updateMergedRecord());
                }
              });
            } else {
              dispatch(setTargetRecordError('There has been a problem with fetch operation: ' + response.status));
            }
       
          }).catch((error) => {
            dispatch(setTargetRecordError('There has been a problem with fetch operation: ' + error.message));
          });

      }
    };
  };
})();

if (__DEV__) {
  window.fetchRecord = fetchRecord;
}