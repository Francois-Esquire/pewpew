const http = require('http');

module.exports = async function Server({
  host,
  port,
  db,
  render,
  assets,
  webpack,
  debug = false,
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
  } = require('./graphql')({ host, port, debug });

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

  server.listen(port, () => {
    console.log(`listening on port: ${port}`);
    createSubscriptionServer({ server });
  });

  return { server, app };
};
