const http = require('http');
const cluster = require('cluster');
const { execute, subscribe } = require('graphql');
const { createLocalInterface } = require('apollo-local-query');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const redis = require('redis');
const chalk = require('chalk');

const app = require('./app');
const mongo = require('./db');
const helpers = require('./helpers');
const schema = require('./schema.js');

module.exports = async function Server({
  domains,
  host,
  port,
  paths,
  hrefs,
  keys,
  urls,
  render,
  assets,
  print,
  debug = false,
  webpack,
}) {
  const middleware = [];
  const routes = [];
  const context = {};
  const config = {
    domains,
    host,
    paths,
    hrefs,
    keys,
  };

  context.db = await mongo(urls.mongo, { debug });
  context.redis = redis.createClient(urls.redis);

  context.helpers = helpers;
  context.helpers.getRootValue = async ctx => Object.assign({
    tasks: ['hey', 'there'],
  }, ctx ? await ctx.helpers.getUser(ctx.state.token) : {});

  if (debug) {
    if (webpack) middleware.push(webpack.middleware);
  }

  middleware.push(async (ctx, next) => {
    ctx.set({ Allow: 'GET, POST' });
    await next();
  });

  routes.push({
    path: '/*',
    verbs: ['get'],
    use: async (ctx, next) => {
      if (/text\/html/.test(ctx.headers.accept)) {
        await render(ctx, Object.assign({}, assets, {
          hrefs,
          networkInterface: createLocalInterface(
            { execute }, schema, {
              rootValue: await ctx.helpers.getRootValue(ctx), context: ctx,
            }),
        }));
        await next();
      }
    },
  });

  const application = app({
    routes,
    middleware,
    context,
    config,
    schema,
    debug,
  });

  const createSubscriptions = server => SubscriptionServer.create({
    schema,
    execute,
    subscribe,
    onConnect: (params, ws) => {
      if (cluster.isWorker) process.send('socket.connect', ws);
      print.log(chalk`\tonConnect params: {bold ${JSON.stringify(params)}}`);
      // return context;
    },
    onOperation: (message, params) => {
      const { id, type, payload } = message;
      print.log(chalk`\tmessage:\n{bold.white ${
        `id: ${id}\ntype: ${type},\npayload: ${JSON.stringify(payload, undefined, 1)}`
      }}\n\n\tparams:\n{bold.white ${
        JSON.stringify(params, undefined, 1)
      }}`);
      return params;
    },
    // onOperationComplete: (ws, opId) => print.log('ws: ', Object.keys(ws), 'opId', opId),
    keepAlive: 1000,
  }, { server });

  const server = http.createServer(application.callback());

  return server.listen(port, () => {
    const sockets = [];

    createSubscriptions(server);

    server.on('connection', (socket) => {
      server.getConnections((err, count) => print.log(`connections: ${count}`));
      const socketId = sockets.length;
      sockets[socketId] = socket;
      socket.on('close', () => sockets.splice(socketId, 1));

      print.log(chalk`new socket connection: ${socketId}, {bold ${Object.keys(socket)}}`);
    });

    // setInterval(() => redis.set('uptime', process.uptime()), 1000);
    // setInterval(() => redis.get('uptime', (error, uptime) => {
    //   print.update(chalk`uptime: {magenta ${uptime}}`);
    // }), 2000);

    print.log(`
    ${chalk`\n\t{bold.green Server {yellow ${process.pid}} is running}`}
    ${chalk`\n\t{bold listening on port: {hex('ff8800').bold ${port}}}\n`}`);
  // eslint-disable-next-line no-sequences
  }), server;
};
