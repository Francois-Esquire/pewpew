import 'whatwg-fetch';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from 'react-apollo';

import 'styles/index.css';

import Application from 'components/Root';
import configClient from 'apollo';
import configStore from 'store';
import installApp from './install';

(function startup() {
  const {
    hrefs,
    appElement,
    app,
  } = installApp();

  const client = configClient({
    uri: hrefs.graphql,
    subUri: hrefs.graphqlSub,
    params: () => {},
  });

  // eslint-disable-next-line no-undef
  const store = configStore(__$$__, {
    apollo: client.reducer(),
  }, [client.middleware()]);

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { AppContainer } = require('react-hot-loader');

    let App = Application;

    const renderApp = () => render(<AppContainer>
      <ApolloProvider client={client} store={store}>
        <BrowserRouter>
          <App app={app} />
        </BrowserRouter>
      </ApolloProvider>
    </AppContainer>, appElement);

    if (module && module.hot) {
      module.hot.accept('./index.js', () => {
        require('./index.js');
        window.location.reload();
      });
      module.hot.accept('./install.js', () => {
        require('./install.js').default();
        // window.location.reload();
      });
      module.hot.accept('components/Root', () => {
        App = require('components/Root').default;
        renderApp();
      });
    }

    return renderApp();
  }

  return render(<ApolloProvider client={client} store={store}>
    <BrowserRouter>
      <Application app={app} />
    </BrowserRouter>
  </ApolloProvider>, appElement);
}());
