import { SET_LOCATION } from '../ui-actions';
import {RESET_WORKSPACE} from '../constants/action-type-constants';

const INITIAL_STATE = {};

export default function location(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_LOCATION:
      return setLocation(state, action.location);
    case RESET_WORKSPACE:
      return INITIAL_STATE;
  }
  return state;
}

export function setLocation(state, location) {
  return location;
}
