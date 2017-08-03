import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import ReactModal from 'react-modal';

import Header from './Header';
import Nexus from './Nexus';

class Application extends React.PureComponent {
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
      <Header openMenu={this.openMenu} />
      <Switch>
        <Route
          exact
          path="/"
          render={() => (<section className="home">
            <img width="50%" src="/images/pewpew.svg" alt="Pew Pew" />
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
        onRequestClose={modal.close}
        closeTimeoutMS={modal.delay}
        shouldCloseOnOverlayClick
        className={modal.className}
        portalClassName={modal.portalClassName}
        overlayClassName={modal.overlayClassName}
        bodyOpenClassName={modal.bodyOpenClassName}
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
  // eslint-disable-next-line max-len
  appElement: (props, propName, componentName) => Element !== undefined && props[propName] instanceof Element === false
    && new Error(`Invalid prop '${propName}' supplied to '${componentName}'. Validation failed.`),
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
