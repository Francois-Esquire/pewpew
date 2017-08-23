import ReactModal from 'react-modal';

import { MODAL_CLOSE, MODAL_OPEN } from '../actions/modal';

const defaults = {
  isOpen: false,
  view: null,
  label: 'modal',
  role: 'dialog',
  delay: 0,
  onOpen: () => null,
  onClose: cb => cb(),
  styleNames: {
    className: 'ReactModal__Content',
    portalClassName: 'ReactModalPortal',
    overlayClassName: 'ReactModal__Overlay',
    bodyOpenClassName: 'ReactModal__Body--open',
  },
  style: ReactModal.defaultStyles,
};

export default function modal(state = defaults, action) {
  if (/@@modal/.test(action.type)) {
    const {
      type,
      view = defaults.view,
      label = defaults.label,
      role = defaults.role,
      delay = defaults.delay,
      onOpen = defaults.onOpen,
      onClose = defaults.onClose,
      styleNames = {},
      style = {},
    } = action;

    if (type === MODAL_CLOSE) {
      return {
        ...state,
        // view,
        isOpen: false,
      };
    }

    return {
      ...state,
      view,
      label,
      role,
      delay,
      onOpen,
      onClose,
      isOpen: type === MODAL_OPEN ? !!view : type === '@@modal/close' && false,
      styleNames: {
        ...defaults.styleNames,
        ...styleNames,
      },
      style: {
        ...defaults.style,
        ...style,
      },
    };
  } return state;
}
