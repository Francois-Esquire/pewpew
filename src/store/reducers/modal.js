const defaults = {
  isOpen: false,
  view: null,
  label: 'modal',
  role: 'dialog',
  delay: 0,
  onOpen: () => null,
  onClose: () => null,
  style: {
    className: 'ReactModal__Content',
    portalClassName: 'ReactModalPortal',
    overlayClassName: 'ReactModal__Overlay',
    bodyOpenClassName: 'ReactModal__Body--open',
  },
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
      style = {},
    } = action;

    return {
      ...state,
      view,
      label,
      role,
      delay,
      onOpen,
      onClose,
      isOpen: type === '@@modal/open' ? !!view : type === '@@modal/close' && false,
      style: {
        ...defaults.style,
        ...style,
      },
    };
  } return state;
}
