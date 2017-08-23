const http = require('http');
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
  emails,
  render,
  assets,
  webpack,
}) {
  const middleware = [];
  const routes = [];
  const context = {};

  context.db = await mongo(config.urls.mongo);
  context.redis = redis.createClient(config.urls.redis);

  context.helpers = helpers;
  context.email = emails;

  if (config.debug) {
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
        if (config.debug) {
          if (ctx.state.webpackStats && ctx.state.webpackStats.hash !== assets.hash) {
            Object.assign(assets, webpack.getAssets(ctx.state.webpackStats));
          }
        }
        await render(ctx, Object.assign({}, assets, {
          hrefs: config.hrefs,
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
    schema,
    assets,
  });

  const createSubscriptions = server => SubscriptionServer.create({
    schema,
    execute,
    subscribe,
    rootValue: {},
    onConnect: (params, ws) => {
      print.log(chalk`\tonConnect params: {bold ${JSON.stringify(params)}}, sid: ${ws.sid}`);
      // server.emit('subscription.connect', ws);
      return helpers.getUser(params.signature);
    },
    onDisconnect: (ws) => {
      print.log(chalk`\tsocket.id: {bold ${ws.sid}} disconnected`);
      // server.emit('subscription.disconnect', ws);
    },
    // onOperation: (message, params) => {
    //   const { id, type, payload } = message;
    //   print.log(chalk`\tmessage:\n{bold.white ${
    //     `id: ${id}\ntype: ${type},\npayload: ${JSON.stringify(payload, undefined, 1)}`
    //   }}\n\n\tparams:\n{bold.white ${
    //     JSON.stringify(params, undefined, 1)
    //   }}`);
    //   return params;
    // },
    onOperationComplete: (ws, opId) => print.log(chalk`operation {bold ${opId || '(id)'} complete.}`),
    keepAlive: 1000,
  }, { server });

  const server = http.createServer(application.callback());
  return server.listen(config.port, () => {
    print.log(`
    ${chalk`\n\t{bold.green Server {yellow ${process.pid}} is running}`}
    ${chalk`\t{bold listening on port: {hex('ff8800').bold ${server.address().port}}}\n`}`);
    // setInterval(() => redis.set('uptime', process.uptime()), 1000);
    // setInterval(() => redis.get('uptime', (error, uptime) => {
    //   print.update(chalk`uptime: {magenta ${uptime}}`);
    // }), 2000);

    createSubscriptions(server);
    return server.emit('listening');
  });
};
