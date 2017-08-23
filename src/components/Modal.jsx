import React from 'react';
import ReactModal from 'react-modal';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';

import types from './proptypes/index';
import { openModal, closeModal } from '../store/actions/modal';

const Modal = ({ match, location, history, modal, appElement }) => {
  const {
    view,
    label,
    role,
    isOpen,
    onOpen,
    onClose,
    close,
    delay,
    style,
    styleNames,
  } = modal;

  const View = () => {
    if (isOpen && view) {
      const V = view;
      return (<V
        modal={modal}
        match={match}
        location={location}
        history={history} />);
    } return null;
  };

  return (<ReactModal
    contentLabel={label}
    role={role}
    isOpen={isOpen}
    onAfterOpen={onOpen}
    onRequestClose={() => onClose(close)}
    closeTimeoutMS={delay}
    shouldCloseOnOverlayClick
    style={style}
    className={styleNames.className}
    portalClassName={styleNames.portalClassName}
    overlayClassName={styleNames.overlayClassName}
    bodyOpenClassName={styleNames.bodyOpenClassName}
    appElement={appElement}
    ariaHideApp>
    <View />
  </ReactModal>);
};

Modal.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  modal: PropTypes.object,
  appElement: types.Element,
};

Modal.defaultProps = {
  modal: {},
  appElement: types.defaults.Element,
};

const ModalView = withRouter(connect(
  ({ modal }) => ({ modal }),
  dispatch => bindActionCreators({ open: openModal, close: closeModal }, dispatch),
  ({ modal }, { open, close }, { match, location, history, appElement }) => {
    Object.assign(modal, { open, close });
    return {
      modal,
      match,
      location,
      history,
      appElement,
    };
  })(Modal));

export default ModalView;
