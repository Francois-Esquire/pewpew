import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { ApolloClient, ApolloProvider, getDataFromTree } from 'react-apollo';
import Helmet from 'react-helmet';

import configStore from '../store';
import Application from '../components/Root';
import Html from './Html';

export default function render(ctx, {
  hrefs,
  meta = [],
  css = [],
  scripts = [],
  networkInterface,
}) {
  const client = new ApolloClient({
    networkInterface,
    dataIdFromObject: o => o.id,
    queryDeduplication: true,
    ssrMode: true,
  });

  const store = configStore(false, {
    apollo: client.reducer(),
  }, [client.middleware()]);

  const app = (<StaticRouter location={ctx.path} context={ctx.state}>
    <ApolloProvider client={client} store={store}>
      <Application app={{ hrefs }} />
    </ApolloProvider>
  </StaticRouter>);

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

      if (ctx.state.view) print.log(`view: ${ctx.state.view}`);
      if (ctx.state.channel) print.log(`channel: ${ctx.state.channel}`);
      if (ctx.state.search) print.log(`search: ${ctx.state.search}`);
      if (ctx.state.hash) print.log(`hash: ${ctx.state.hash}`);

      const window = {
        pewpew: { hrefs },
        __$$__: store.getState(),
      };

      ctx.type = 'text/html';
      ctx.body = `<!DOCTYPE html>\n${
        ReactDOMServer.renderToStaticMarkup(
          <Html
            html={html}
            meta={meta}
            head={head}
            css={css}
            scripts={scripts}
            window={window} />)
          .replace(/(<\/head>)<body>/g, `${meta.join('')}</head>`)
      }`;

      return resolve();
    }).catch(reject);
  });
}
