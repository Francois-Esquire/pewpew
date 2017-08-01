const { execute, subscribe } = require('graphql');
const { graphqlKoa, graphiqlKoa } = require('graphql-server-koa');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { createLocalInterface } = require('apollo-local-query');

module.exports = function graphqlConfig({
  debug,
  host = 'localhost:3000',
  port = 3000,
  path = '/graphql',
  subscriptionPath,
}) {
  const schema = require('./schema.js');

  const getRootValue = async ctx => Object.assign({
    tasks: ['hey', 'there'],
  }, await ctx.helpers.getUser(ctx.state.token));

  return {
    localInterface: async ctx => createLocalInterface(
      { execute }, schema, { rootValue: await getRootValue(ctx), context: ctx }),
    graphql: graphqlKoa(async ctx => ({
      schema,
      rootValue: await getRootValue(ctx),
      context: ctx,
      debug,
    })),
    graphiql: debug && graphiqlKoa({
      endpointURL: path,
      subscriptionsEndpoint: subscriptionPath || `ws://${host}${path}`,
    }),
    createSubscriptionServer(options = {}) {
      const { server, keepAlive = 1000 } = options;

      return SubscriptionServer.create({
        schema,
        execute,
        subscribe,
        // onOperation: (message, params, socket) => {
        //   console.log('onOperation - params: ',params);
        //   return params;
        // },
        // onOperationComplete: (socket) => console.log('subscription operation complete'),
        // onConnect: (connectionParams, webSocket) => {
        //   console.log('subscription socket: onConnect', connectionParams);
        // },
        // onDisconnect: (webSocket) => {
        //   console.log('subscription socket: onDisconnect');
        // },
        keepAlive,
      }, (server ? {
          server,
          path,
        } : {
          host,
          port,
          path,
        }));
    },
  };
};
