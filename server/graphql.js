const { execute, subscribe } = require('graphql');
const { graphqlKoa, graphiqlKoa } = require('graphql-server-koa');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { createLocalInterface } = require('apollo-local-query');

module.exports = function graphqlConfig({
  debug,
  host,
  port,
  path,
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
    graphiql: graphiqlKoa({
      endpointURL: path,
      subscriptionsEndpoint: `ws://${host}${path}`,
    }),
    createSubscriptionServer(options = {}) {
      const { server, keepAlive = 1000 } = options;

      return SubscriptionServer.create({
        schema,
        execute,
        subscribe,
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
