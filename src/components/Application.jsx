import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import Helmet from 'react-helmet';

import types from './proptypes/index';

import Header from './Header';
import Home from './Home';
import Prism from './Prism';
import Modal from './Modal';

class Application extends React.Component {
  getChildContext() {
    const { app, modal } = this.props;
    return {
      modal,
      app,
    };
  }
  componentWillReceiveProps(Props) {
    const {
      channel,
      modal,
      location,
    } = Props;

    if (modal.isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';

    const path = location.pathname.replace(/^\//, '');

    if (path !== channel.url) channel.change(path);
    if (location.pathname !== this.props.location.pathname) {
      if (modal.view) modal.close();
    }
  }
  render() {
    const { app, staticContext, channel } = this.props;
    return (<main id="view">
      <Header channel={channel} />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/:channel" component={Prism} />
      </Switch>
      <footer>
        <h6><a href={app.hrefs.github}>github</a></h6>
      </footer>
      <Modal appElement={app.appElement} />
      <Helmet
        encodeSpecialCharacters={!!staticContext}
        titleTemplate="%s | Pew Pew">
        <title itemProp="name" lang="en">Shoot</title>
      </Helmet>
    </main>);
  }
}

Application.propTypes = {
  app: PropTypes.shape({
    hrefs: PropTypes.object,
    appElement: types.Element,
    upload: PropTypes.func,
  }),
  // eslint-disable-next-line react/forbid-prop-types
  channel: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  modal: PropTypes.object,
};

Application.defaultProps = {
  app: {
    appElement: types.defaults.Element,
    upload: () => Promise.resolve(),
  },
  channel: {},
  modal: {},
};

Application.childContextTypes = {
  app: PropTypes.object,
  modal: PropTypes.object,
};

export default Application;
