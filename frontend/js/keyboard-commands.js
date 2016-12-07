import { setEverySubrecordAction } from './action-creators/subrecord-actions';

export function initKeyboardListener(el, store) {

  function onKeyDown(keyEvent) {

    if (keyEvent.keyCode == 77 && keyEvent.ctrlKey) {
      store.dispatch(setEverySubrecordAction());
    }
  }

  el.addEventListener('keydown', onKeyDown);
}