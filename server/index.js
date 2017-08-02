const http = require('http');

module.exports = async function Server({
  unix_socket,
  host,
  port,
  paths,
  render,
  assets,
  debug = false,
  webpack,
  db,
}) {
  const keys = ['ssssseeeecret', 'ssshhhhhhhhh'];

  const routes = [];

  const middleware = [];

  const context = {};

  if (debug) {
    if (webpack) {
      context.webpack = webpack;
      middleware.push(webpack.middleware);
    }
    context.db = db;
  } else {
    context.db = await require('./db')({ debug });
  }
  context.helpers = require('./helpers');
  context.render = render;
  context.assets = assets;

  const {
    graphql,
    graphiql,
    localInterface,
    createSubscriptionServer,
  } = require('./graphql')({ debug, host, port, path: paths.graphql });

  if (graphql) {
    routes.push({
      path: '/graphql',
      verbs: ['get', 'post'],
      use: graphql,
    });

    if (localInterface) context.localInterface = localInterface;

    if (graphiql) {
      routes.push({
        path: '/graphiql',
        verbs: ['get'],
        use: graphiql,
      });
    }
  }

  const app = require('./app')({
    keys,
    routes,
    middleware,
    context,
    debug,
  });

  const server = http.createServer(app.callback());

  // eslint-disable-next-line camelcase
  server.listen(unix_socket || port, () => {
    // eslint-disable-next-line camelcase
    if (unix_socket) {
      // eslint-disable-next-line camelcase
      console.log(`app is listening on unix socket: ${unix_socket}`);
      require('fs').openSync('/tmp/app-initialized', 'w');
    } else console.log(`listening on port: ${port}`);
    createSubscriptionServer({ server });
  });

  return { server, app };
};
