import fetch from 'isomorphic-fetch';
import HttpStatus from 'http-status-codes';

import {DUPLICATE_COUNT_SUCCESS, DUPLICATE_COUNT_ERROR, 
  NEXT_DUPLICATE_SUCCESS, NEXT_DUPLICATE_ERROR} from '../constants/action-type-constants';

const APIBasePath = __DEV__ ? 'http://localhost:3001/duplicates': '/duplicates';

export function fetchCount() {

  return function(dispatch) {

    const fetchOptions = {
      method: 'GET',
      credentials: 'include'
    };
   
    return fetch(`${APIBasePath}/pairs/count`, fetchOptions)
      .then(response => {

        if (response.status == HttpStatus.OK) {

          response.text().then(res => {
            if (isNaN(res)) {
              return dispatch(fetchDuplicateCountError('Duplicate count was not a number'));
            }
            dispatch(fetchDuplicateCountSuccess(parseInt(res)));  
          });

        } else {
          switch (response.status) {
          case HttpStatus.UNAUTHORIZED: return dispatch(fetchDuplicateCountError('Käyttäjätunnus ja salasana eivät täsmää.'));
          }

          dispatch(fetchDuplicateCountError('Tuplien lukumäärän haussa tapahtui virhe.'));
        }

      }).catch((error) => {
        dispatch(fetchDuplicateCountError('There has been a problem with operation: ' + error.message));
      });
  };
}

function fetchDuplicateCountSuccess(count) {
  return { type: DUPLICATE_COUNT_SUCCESS, count};
}

function fetchDuplicateCountError(error) {
  return { type: DUPLICATE_COUNT_ERROR, error};
}

window.fetchCount = fetchCount;



export function fetchNextPair() {

  return function(dispatch) {

    const fetchOptions = {
      method: 'GET',
      credentials: 'include'
    };
   
    return fetch(`${APIBasePath}/pairs/next`, fetchOptions)
      .then(response => {

        if (response.status == HttpStatus.OK) {

          response.json().then(res => {
            
            dispatch(fetchNextPairSuccess(res));  
          });

        } else {
          switch (response.status) {
          case HttpStatus.UNAUTHORIZED: return dispatch(fetchNextPairError('Käyttäjätunnus ja salasana eivät täsmää.'));
          }

          dispatch(fetchNextPairError('Seuraavan tietueparin hakemisessa tapahtui virhe.'));
        }

      }).catch((error) => {
        dispatch(fetchNextPairError('There has been a problem with operation: ' + error.message));
      });
  };
}

window.fetchNextPair = fetchNextPair;

function fetchNextPairSuccess(pair) {
  return { type: NEXT_DUPLICATE_SUCCESS, pair};
}

function fetchNextPairError(error) {
  return { type: NEXT_DUPLICATE_ERROR, error};
}


/*
export function fetchNextPair() {

 
  return function(dispatch, getState) {
    dispatch(commitMergeStart());

    const sourceRecord = getState().getIn(['sourceRecord', 'record']);
    const targetRecord = getState().getIn(['targetRecord', 'record']);
    const mergedRecord = getState().getIn(['mergedRecord', 'record']);

  /*
    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify({ 
        preferredRecord: targetRecord,
        otherRecord: sourceRecord,
        mergedRecord
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      credentials: 'include'
    };
   

    return fetch(`${APIBasePath}/pairs/next`, fetchOptions)
      .then(response => {

        if (response.status == HttpStatus.OK) {

          response.json().then(res => {
            const newMergedRecordId = res.recordId;
            dispatch(commitMergeSuccess(newMergedRecordId));  
          });

        } else {
          switch (response.status) {
          case HttpStatus.UNAUTHORIZED: return dispatch(commitMergeError('Käyttäjätunnus ja salasana eivät täsmää.'));
          case HttpStatus.INTERNAL_SERVER_ERROR: return dispatch(commitMergeError('Tietueen tallennuksessa tapahtui virhe.'));
          }

          dispatch(commitMergeError('Tietueen tallennuksessa tapahtui virhe.'));
        }

      }).catch((error) => {
        dispatch(commitMergeError('There has been a problem with operation: ' + error.message));
      });

  };
}

 */