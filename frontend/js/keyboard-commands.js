import { SubrecordActionTypes } from './constants';
import { setEverySubrecordAction } from './action-creators/subrecord-actions';

export function initKeyboardListener(el, store) {

  function onKeyDown(keyEvent) {

    if (keyEvent.keyCode == 77 && keyEvent.ctrlKey) {
      store.dispatch(setEverySubrecordAction(SubrecordActionTypes.MERGE));
    }
  }

  el.addEventListener('keydown', onKeyDown);
}