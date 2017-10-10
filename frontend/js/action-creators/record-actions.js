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