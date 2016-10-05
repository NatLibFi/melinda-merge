import { Map } from 'immutable';
import { CREATE_SESSION_START, CREATE_SESSION_ERROR, CREATE_SESSION_SUCCESS, VALIDATE_SESSION_START } from '../ui-actions';

const INITIAL_STATE = Map({
  state: 'NO_SESSION',
  userinfo: undefined,
  error: undefined
});

export default function session(state = INITIAL_STATE, action) {
  switch (action.type) {
  case CREATE_SESSION_START:
    return createSessionStart(state);
  case CREATE_SESSION_ERROR:
    return createSessionError(state, action.message);
  case CREATE_SESSION_SUCCESS:
    return createSessionSuccess(state);
  case VALIDATE_SESSION_START:
    return validateSessionStart(state);
  }
  return state;
}

export function createSessionStart(state) {
  return state.set('state', 'SIGNIN_ONGOING');
}

export function createSessionError(state, message) {
  return state
    .set('state', 'SIGNIN_ERROR')
    .set('error', message);
}

export function createSessionSuccess(state, userinfo) {
  return state
    .set('state', 'SIGNIN_OK')
    .set('userinfo', userinfo);
}

export function validateSessionStart(state) {
  return state
    .set('state', 'VALIDATION_ONGOING');
}
