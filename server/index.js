const http = require('http');

module.exports = async function Server({
  unix_socket,
  protocol,
  domains,
  host,
  port,
  paths,
  hrefs,
  keys,
  redis,
  render,
  assets,
  debug = false,
  webpack,
  db,
}) {
  const routes = [];

  const middleware = [];

  const context = {
    helpers: require('./helpers'),
    domains,
    redis,
  };
  // console.log('cpus: ', require('os').cpus().length);
  // setInterval(() => redis.get('uptime', (error, uptime) => console.log('uptime', uptime)), 2000);

  if (debug) {
    if (webpack) {
      context.webpack = webpack;
      middleware.push(webpack.middleware);
    }
    context.db = db;
  } else {
    context.db = await require('./db')({ debug });
  }

  const {
    graphql,
    graphiql,
    localInterface,
    createSubscriptionServer,
  } = require('./graphql')({ debug, protocol, domain: domains.graphql, host, port, hrefs });

  routes.push({
    path: '/*',
    verbs: ['get'],
    use: async (ctx, next) => {
      if (!/text\/html/.test(ctx.headers.accept)) return next();

      await render(ctx, Object.assign({}, assets, {
        hrefs,
        networkInterface: await localInterface(ctx),
      }));

      return next();
    },
  });

  middleware.push(async (ctx, next) => {
    ctx.set({ Allow: 'GET, POST' });
    await next();
  });

  const app = require('./app')({
    gql: { graphql, graphiql },
    keys,
    paths,
    routes,
    middleware,
    context,
    domains,
    debug,
  });
  const server = http.createServer(app.callback());

  // eslint-disable-next-line camelcase
  server.listen(unix_socket || port, () => {
    // eslint-disable-next-line camelcase
    if (unix_socket) {
      // eslint-disable-next-line
      console.log(`app is listening on unix socket: ${unix_socket}`);
      require('fs').openSync('/tmp/app-initialized', 'w');
      // eslint-disable-next-line no-console
    } else console.log(`listening on port: ${port}`);
    createSubscriptionServer(server);
  });

  return { server, app };
};
