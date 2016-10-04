
export function createSessionStart(state) {
  return state.set('sessionState', 'SIGNIN_ONGOING');
}

export function createSessionError(state, message) {
  return state
    .set('sessionState', 'SIGNIN_ERROR')
    .set('createSessionErrorMessage', message);
}

export function createSessionSuccess(state, userinfo) {
  return state
    .set('sessionState', 'SIGNIN_OK')
    .set('userinfo', userinfo);
}

export function validateSessionStart(state) {
  return state
    .set('sessionState', 'VALIDATION_ONGOING');
}
