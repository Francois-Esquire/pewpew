import 'babel-polyfill';
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
    __$__,
    pewpew: {
      endpoints: {
        graphql,
      },
    },
    location: {
      protocol,
      host,
    },
  } = window;

  const client = configClient({
    uri: `${protocol}//${host}/${graphql}`,
  });

  const store = configStore(__$__, {
    apollo: client.reducer(),
  }, [client.middleware()]);

  const appElement = document.getElementById('app');

  if (process.env.NODE_ENV !== 'production') {
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
      <Application appElement={appElement} />
    </BrowserRouter>
  </ApolloProvider>, appElement);
}());
