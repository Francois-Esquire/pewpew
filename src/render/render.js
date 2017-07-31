import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { ApolloClient, ApolloProvider, getDataFromTree } from 'react-apollo';
import Helmet from 'react-helmet';

import configStore from '../store';
import Application from '../components/Root';
// import Application from '../appl.es';
import Html from './Html';

export default function render(ctx, {
  css = [],
  scripts = [],
  manifest = [],
  meta = [],
  networkInterface,
}) {
  if (ctx.state === undefined) ctx.state = {};

  const client = new ApolloClient({
    dataIdFromObject: o => o.id,
    networkInterface,
    ssrMode: true,
  });

  const store = configStore(false, {
    apollo: client.reducer(),
  }, [client.middleware()]);

  const app = (<StaticRouter location={ctx.path} context={ctx.state}>
    <ApolloProvider client={client} store={store}>
      <Application isServer />
    </ApolloProvider>
  </StaticRouter>);

  // if (ctx.state.webpackStats) {
  //   Object.keys(ctx.state.webpackStats.compilation.assets)
  //     .filter(src => /^()/.test(src))
  //     .forEach(src => scripts.push(src));
  // }
  // eslint-disable-next-line no-confusing-arrow
  scripts.sort(a => a.startsWith('manifest') ? -1 : a.startsWith('client') ? 1 : -1);

  return new Promise((resolve, reject) => {
    getDataFromTree(app).then(() => {
      const html = ReactDOMServer.renderToString(app);
      const head = Helmet.rewind();

      if ([301, 302, 404].includes(ctx.state.status)) {
        if (ctx.state.status === 404) ctx.status = ctx.state.status;
        else {
          ctx.status = ctx.state.status;
          ctx.redirect(ctx.state.url);
          return resolve();
        }
      }

      const markup = ReactDOMServer.renderToStaticMarkup(
        <Html
          html={html}
          head={head}
          meta={meta}
          css={css}
          scripts={scripts}
          window={{
            webpackManifest: manifest.join(''),
            __$__: store.getState(),
          }} />);

      ctx.type = 'text/html';
      ctx.body = `<!DOCTYPE html>\n${markup}`;

      return resolve();
    }).catch(reject);
  });
}
