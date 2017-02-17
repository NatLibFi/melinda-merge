import { setEverySubrecordAction, setEveryMatchedSubrecordAction } from './action-creators/subrecord-actions';

export function initKeyboardListener(el, store) {

  function onKeyDown(keyEvent) {

    if (keyEvent.keyCode == 77 && keyEvent.ctrlKey) {
      store.dispatch(setEverySubrecordAction());
    }
    
    if (keyEvent.keyCode == 77 && keyEvent.altKey) {
      store.dispatch(setEveryMatchedSubrecordAction());
    }
    
  }

  el.addEventListener('keydown', onKeyDown);
}
