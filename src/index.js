import 'babel-polyfill';
import 'whatwg-fetch';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from 'react-apollo';

import configClient from './apollo';
import configStore from './store';
import Application from './components/Root';

import './styles/index.css';

(function startup() {
  const {
    __$$__,
    pewpew: { hrefs },
  } = window;

  const app = {
    upload(file) {
      const body = new FormData();
      body.append('file', file);

      // eslint-disable-next-line compat/compat
      return fetch(hrefs.upload, {
        body,
        method: 'POST',
        headers: {},
        credentials: 'same-origin',
      });
    },
  };

  const client = configClient({
    uri: hrefs.graphql,
    subUri: hrefs.graphqlSub,
    params: {},
  });

  const store = configStore(__$$__, {
    apollo: client.reducer(),
  }, [client.middleware()]);

  const appElement = document.getElementById('app');

  // delete window.pewpew;
  // delete window.__$$__;

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { AppContainer } = require('react-hot-loader');

    let App = Application;

    const renderApp = () => render(<AppContainer>
      <ApolloProvider client={client} store={store}>
        <BrowserRouter>
          <App app={app} appElement={appElement} />
        </BrowserRouter>
      </ApolloProvider>
    </AppContainer>, appElement);

    if (module && module.hot) {
      module.hot.accept('./components/Root', () => {
        App = require('./components/Root').default;
        renderApp();
      });
    }

    return renderApp();
  }

  return render(<ApolloProvider client={client} store={store}>
    <BrowserRouter>
      <Application app={app} appElement={appElement} />
    </BrowserRouter>
  </ApolloProvider>, appElement);
}());
