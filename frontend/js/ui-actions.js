import fetch from 'isomorphic-fetch';
import MARCRecord from 'marc-record-js';

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

              response.json().then(json => {
                
                if (currentSourceRecordId === recordId) {
                  const marcRecord = new MARCRecord(json);
                  dispatch(setSourceRecord(marcRecord));
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
