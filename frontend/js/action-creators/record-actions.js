import { SAVE_RECORD_START, SAVE_RECORD_SUCCESS, SAVE_RECORD_FAILURE } from '../constants/action-type-constants';
import HttpStatus from 'http-status-codes';
import MarcRecord from 'marc-record-js';
import fetch from 'isomorphic-fetch';
import { exceptCoreErrors } from '../utils';
import { FetchNotOkError } from '../errors';
import uuid from 'node-uuid';


export function saveRecordStart(recordId) {
  return { type: SAVE_RECORD_START, recordId };
}

export function saveRecordSuccess(recordId, record) {
  return { type: SAVE_RECORD_SUCCESS, recordId, record };
}

export function saveRecordFailure(recordId, error) {
  return { 'type': SAVE_RECORD_FAILURE, recordId, error };
}

export const saveRecord = (function() {
  const APIBasePath = __DEV__ ? 'http://localhost:3001/api': '/api';
  
  return function(recordId, record) {

    return function(dispatch) {

      dispatch(saveRecordStart(recordId));
      
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

          const mainRecord = json.record;
      
          const marcRecord = new MarcRecord(mainRecord);
         
          marcRecord.fields.forEach(field => {
            field.uuid = uuid.v4();
          });

          dispatch(saveRecordSuccess(recordId, marcRecord));
   
        }).catch(exceptCoreErrors((error) => {

          if (error instanceof FetchNotOkError) {
            switch (error.response.status) {
              case HttpStatus.BAD_REQUEST: return dispatch(saveRecordFailure(recordId, new Error(error.message)));
              case HttpStatus.NOT_FOUND: return dispatch(saveRecordFailure(recordId, new Error('Tietuetta ei löytynyt')));
              case HttpStatus.INTERNAL_SERVER_ERROR: return dispatch(saveRecordFailure(recordId, new Error('Tietueen tallentamisessa tapahtui virhe.')));
            }
          }

          dispatch(saveRecordFailure(recordId, new Error('There has been a problem with fetch operation: ' + error.message)));

        }));
    };
  };
})();


function validateResponseStatus(response) {
  if (response.status !== HttpStatus.OK) {

    return response.text().then(errorReason => {
      throw new FetchNotOkError(response, errorReason);
    });
  }
  return response;
}