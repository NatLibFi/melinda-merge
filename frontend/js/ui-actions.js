import fetch from 'isomorphic-fetch';
import MARCRecord from 'marc-record-js';
import HttpStatus from 'http-status-codes';
import * as Cookies from 'js-cookie';
import {hashHistory} from 'react-router';
import _ from 'lodash';

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
      return hashHistory.push('/signin');
    }

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
          hashHistory.push('/signin');
        }
      });
  };
}

export function removeSession() {
  return function() {
    Cookies.remove('sessionToken');
    setTimeout(() => {
      hashHistory.push('/signin');
    }, 150);
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
              hashHistory.push('/');

            });

          } else {
            switch (response.status) {
            case HttpStatus.BAD_REQUEST: return dispatch(createSessionError('Syötä käyttäjätunnus ja salasana'));
            case HttpStatus.UNAUTHORIZED: return dispatch(createSessionError('Käyttäjätunnus ja salasana eivät täsmää'));
            case HttpStatus.INTERNAL_SERVER_ERROR: return dispatch(createSessionError('Käyttäjätunnuksen tarkastuksessa tapahtui virhe. Yritä hetken päästä uudestaan.'));
            }

            dispatch(createSessionError('Käyttäjätunnuksen tarkastuksessa tapahtui virhe. Yritä hetken päästä uudestaan.'));
            
          }

        }).catch((error) => {
          dispatch(createSessionError('There has been a problem with operation: ' + error.message));
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

            if (response.status == HttpStatus.OK) {

              return response.json().then(json => {
                
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

            if (response.status == HttpStatus.OK) {

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
