import { SET_LOCATION } from '../ui-actions';

export default function location(state = {}, action) {
  switch (action.type) {
  case SET_LOCATION:
    return setLocation(state, action.location);
  }
  return state;
}

export function setLocation(state, location) {
  return location;
}
