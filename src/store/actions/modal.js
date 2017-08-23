export const MODAL_OPEN = '@@modal/open';
export const MODAL_CLOSE = '@@modal/close';

export const openModal = (view, {
  label,
  role,
  delay,
  onOpen,
  onClose,
  styleNames,
  style,
}) => ({
  type: MODAL_OPEN,
  view,
  label,
  role,
  delay,
  onOpen,
  onClose,
  styleNames,
  style,
});

export const closeModal = () => ({ type: MODAL_CLOSE });
