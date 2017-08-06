const { execute, subscribe } = require('graphql');
const { graphqlKoa, graphiqlKoa } = require('graphql-server-koa');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { createLocalInterface } = require('apollo-local-query');

module.exports = function graphqlConfig({
  debug,
  host,
  port,
  hrefs,
}) {
  const schema = require('./schema.js');

  const getRootValue = async ctx => Object.assign({
    tasks: ['hey', 'there'],
  }, ctx ? await ctx.helpers.getUser(ctx.state.token) : {});

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
      endpointURL: hrefs.graphql,
      subscriptionsEndpoint: hrefs.graphqlSub,
    }),
    createSubscriptionServer(server, options = {}) {
      const { keepAlive = 1000 } = options;

      return SubscriptionServer.create({
        rootValue: getRootValue,
        schema,
        execute,
        subscribe,
        keepAlive,
      }, { server });
    },
  };
};
