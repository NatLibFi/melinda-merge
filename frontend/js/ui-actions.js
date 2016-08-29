import fetch from 'isomorphic-fetch';

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

export function fetchSourceRecord(recordId) {

  return function (dispatch) {

    dispatch(loadSourceRecord(recordId));

    return fetch(`http://localhost:3001/api/${recordId}`)
      .then(response => response.json())
      .then(json =>

        dispatch(setSourceRecord(json))
      );

      // TODO catch any error in the network call.
  };
}
