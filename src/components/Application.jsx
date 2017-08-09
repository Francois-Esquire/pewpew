import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import Modal from 'react-modal';
import Helmet from 'react-helmet';

import Header from './Header';
import Home from './Home';
// import Nexus from './Nexus';

class Application extends React.Component {
  getChildContext() {
    const { modal } = this.props;
    return {
      modal,
    };
  }
  componentWillReceiveProps(Props) {
    const {
      modal,
      location,
    } = Props;

    if (modal.isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';

    if (location.pathname !== this.props.location.pathname) {
      if (modal.view) modal.close();
    }
  }
  render() {
    const { appElement, isServer, match, location, history, modal, channel } = this.props;
    // eslint-disable-next-line no-confusing-arrow
    // const ModalView = () => ;

    return (<main id="view">
      <Header channel={channel.url} openMenu={this.openMenu} />
      <Switch>
        <Route
          exact
          path="/"
          render={() => <Home history={history} channel={channel} />} />
        {/* <Route
          path="/:channel"
          render={({ match: { params } }) => (<Nexus channel={params.channel} />)} /> */}
      </Switch>
      <footer>
        <h6><a href="https://github.com/Francois-Esquire/pewpew">github</a></h6>
      </footer>
      <Modal
        contentLabel={modal.label}
        role={modal.role}
        isOpen={modal.isOpen}
        onAfterOpen={modal.onOpen}
        onRequestClose={() => modal.onClose(modal.close)}
        closeTimeoutMS={modal.delay}
        shouldCloseOnOverlayClick
        style={modal.style}
        className={modal.styleNames.className}
        portalClassName={modal.styleNames.portalClassName}
        overlayClassName={modal.styleNames.overlayClassName}
        bodyOpenClassName={modal.styleNames.bodyOpenClassName}
        appElement={appElement}
        ariaHideApp>{modal.isOpen && modal.view ?
          (<modal.view modal={modal} match={match} location={location} history={history} />) : null
        }</Modal>
      <Helmet
        encodeSpecialCharacters={!isServer}
        titleTemplate="%s | Pew Pew">
        <title itemProp="name" lang="en">Shoot</title>
      </Helmet>
    </main>);
  }
}

Application.propTypes = {
  appElement(props, propName, componentName) {
    if (!props.isServer && props[propName] instanceof Element === false) {
      return new Error(`Invalid prop '${propName}' supplied to '${componentName}'. Validation failed.`);
    }
    return null;
  },
  isServer: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  match: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  location: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  modal: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  channel: PropTypes.object,
};

Application.defaultProps = {
  appElement: undefined,
  isServer: false,
  match: {},
  location: {},
  history: {},
  modal: {},
  channel: {},
};

Application.childContextTypes = {
  modal: PropTypes.object,
};

export default Application;
