const http = require('http');
const { execute, subscribe } = require('graphql');
const { createLocalInterface } = require('apollo-local-query');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { graphqlKoa, graphiqlKoa } = require('graphql-server-koa');

module.exports = async function Server({
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
  const context = {
    domains,
    redis,
  };
  context.db = db || await require('./db')({ debug });

  const routes = [];

  const middleware = [];

  if (debug) {
    if (webpack) middleware.push(webpack.middleware);
  }

  middleware.push(async (ctx, next) => {
    ctx.set({ Allow: 'GET, POST' });
    await next();
  });

  const schema = require('./schema.js');
  const helpers = require('./helpers');

  const getRootValue = async ctx => Object.assign({
    tasks: ['hey', 'there'],
  }, ctx ? await helpers.getUser(ctx.state.token) : {});

  routes.push({
    path: '/*',
    verbs: ['get'],
    use: async (ctx, next) => {
      if (!/text\/html/.test(ctx.headers.accept)) return next();

      const networkInterface = createLocalInterface(
        { execute }, schema, { rootValue: await getRootValue(ctx), context: ctx });

      await render(ctx, Object.assign({}, assets, {
        hrefs,
        networkInterface,
      }));

      return next();
    },
  });

  const app = require('./app')({
    graphql: graphqlKoa(async ctx => ({
      schema,
      rootValue: await getRootValue(ctx),
      context: ctx,
      debug,
    })),
    graphiql: graphiqlKoa({
      endpointURL: hrefs.graphql,
      subscriptionsEndpoint: hrefs.graphqlSub,
    }),
    keys,
    paths,
    routes,
    middleware,
    context,
    domains,
    host,
    debug,
  });

  const server = http.createServer(app.callback());

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`listening on port: ${port}`);
    SubscriptionServer.create({
      keepAlive: 1000,
      // rootValue: getRootValue,
      schema,
      execute,
      subscribe,
      // onOperation: message => console.log('message: ', message),
      // onOperationComplete: (ws, opId) => console.log('ws: ', Object.keys(ws), 'opId', opId),
      // onConnect: params => console.log('params:', params),
    }, { server });
  });

  // setInterval(() => redis.set('uptime', process.uptime()), 1000);
  // setInterval(() => redis.get('uptime', (error, uptime) => {
  //   // console.log('uptime', uptime);
  // }), 2000);

  return { server, app };
};
