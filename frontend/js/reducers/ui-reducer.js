import { Map } from 'immutable'; 
import { RESET_WORKSPACE, TOGGLE_COMPACT_SUBRECORD_VIEW, UPDATE_SUBRECORD_ARRANGEMENT } from '../constants/action-type-constants';

const INITIAL_STATE = Map({
  compactSubrecordView: false,
  compactedRows: []
});

export default function ui(state = INITIAL_STATE, action) {
  switch (action.type) {
    case RESET_WORKSPACE:
      return INITIAL_STATE;
    case TOGGLE_COMPACT_SUBRECORD_VIEW:
      return setCompactSubrecordView(state, action.enabled, action.rowsToCompact);
    case UPDATE_SUBRECORD_ARRANGEMENT:
      return setCompactSubrecordView(state, false, []);

  }
  return state;
}

function setCompactSubrecordView(state, isEnabled, rowsToCompact) {

  return state
    .set('compactSubrecordView', isEnabled)
    .set('compactedRows', rowsToCompact);
}
