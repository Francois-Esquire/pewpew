import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from 'react-apollo';

import configClient from './apollo';
import configStore from './store';
import Application from './components/Root';

import './styles/index.css';

// eslint-disable-next-line func-names
(function () {
  const {
    protocol = 'http:',
    host = 'localhost:3000',
  } = window.location || {};

  const client = configClient({
    uri: `${protocol}//${host}/graphql`,
  });

  // eslint-disable-next-line no-underscore-dangle
  const store = configStore(window.__$__, {
    apollo: client.reducer(),
  }, [client.middleware()]);

  const appElement = document.getElementById('app');

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { AppContainer } = require('react-hot-loader');

    let App = Application;

    const renderApp = () => render(<AppContainer>
      <ApolloProvider client={client} store={store}>
        <BrowserRouter>
          <App appElement={appElement} />
        </BrowserRouter>
      </ApolloProvider>
    </AppContainer>, appElement);

    module.hot.accept('./components/Root', () => {
      App = require('./components/Root').default;
      renderApp(App);
    });

    module.hot.accept('./store/reducers', () => {
      const reducers = require('./store/reducers');
      store.replaceReducer({
        apollo: client.reducer(),
        ...reducers,
      });
    });

    return renderApp();
  }

  return render(<ApolloProvider client={client} store={store}>
    <BrowserRouter>
      <Application appElement={appElement} />
    </BrowserRouter>
  </ApolloProvider>, appElement);
}());
