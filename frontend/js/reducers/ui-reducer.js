import { Map } from 'immutable'; 
import { RESET_WORKSPACE, TOGGLE_COMPACT_SUBRECORD_VIEW} from '../constants/action-type-constants';

const INITIAL_STATE = Map({
  compactSubrecordView: false
});

export default function ui(state = INITIAL_STATE, action) {
  switch (action.type) {
    case RESET_WORKSPACE:
      return INITIAL_STATE;
    case TOGGLE_COMPACT_SUBRECORD_VIEW:
      return setCompactSubrecordView(state, action.enabled);
  }
  return state;
}

function setCompactSubrecordView(state, isEnabled) {
  return state.set('compactSubrecordView', isEnabled);
}
