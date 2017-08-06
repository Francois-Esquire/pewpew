import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import ReactModal from 'react-modal';

import PewPew from './icons/pewpew';
import Header from './Header';
import Nexus from './Nexus';

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
    const Modal = () => modal.isOpen && modal.view ?
      (<modal.view modal={modal} match={match} location={location} history={history} />) : null;

    return (<main id="view">
      {/* <Header channel={channel.url} openMenu={this.openMenu} /> */}
      <Switch>
        <Route
          exact
          path="/"
          render={() => (<section className="home">
            {/* <img width="50%" src="/images/pewpew.svg" alt="Pew Pew" /> */}
            <PewPew color="#fff" />
            <form
              id="channel"
              onSubmit={(event) => {
                event.preventDefault();
                return history.push(`/${channel.url}`);
              }}>
              <label htmlFor="remote">/</label>
              <input
                id="remote"
                type="text"
                value={channel.url}
                placeholder="Tune in to..."
                onChange={({ target: { value } }) => channel.change(value.toLowerCase())} />
              <button type="submit">Go</button>
            </form>
          </section>)} />
        <Route
          path="/:channel"
          render={({ match: { params } }) => (<Nexus channel={params.channel} />)} />
      </Switch>
      <footer>
        <h6><a href="https://github.com/Francois-Esquire/pewpew">github</a></h6>
      </footer>
      <ReactModal
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
        ariaHideApp>
        <Modal />
      </ReactModal>
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
