const mongoose = require('mongoose');
const { makeExecutableSchema } = require('graphql-tools');
const { withFilter, PubSub } = require('graphql-subscriptions');

const Users = mongoose.model('User');
const Channels = mongoose.model('Channel');
const Posts = mongoose.model('Post');

const pubsub = new PubSub();

['publish', 'subscribe', 'unsubscribe', 'asyncIterator']
  .forEach((key) => { pubsub[key] = pubsub[key].bind(pubsub); });

const schemaIndex = require('../schema/index.graphql');

const typeDefs = [schemaIndex];

const resolvers = {
  URL: {

  },
  Query: {
    tasks: root => root.tasks.concat('graphql'),
    me: root => root.user,
    author: async (root, args) => {
      const { id } = args;
      const user = await Users.findOne(id);
      return user;
    },
    channel: async (root, { id }) => Channels.findOne(id),
    channels: async (root, { limit }) => Channels.search(limit),
  },
  Mutation: {
    async join(root, args, ctx) {
      if (root.user) return root.user;
      const { handle } = args;
      const user = await Users.join(handle, ctx);
      return user;
    },
    async signup(root, args, ctx) {
      if (root.user) return root.user;
      const { handle, email, password } = args;
      const user = await Users.createUser(handle, email, password, ctx);
      return user;
    },
    async login(root, args, ctx) {
      if (root.user) return root.user;
      const { handle, password } = args;
      const user = await Users.loginUser(handle, password, ctx);
      return user;
    },
    logout: (root, args, ctx) =>
      root.user && root.user.logout(ctx),
    changePassword: (root, { pass, word }) =>
      root.user && root.user.changePassword(pass, word),
    changeHandle: (root, { handle }) =>
      root.user && root.user.changeHandle(handle),
    changeEmail: (root, { email }) =>
      root.user && root.user.changeEmail(email),
    deleteAccount: root =>
      root.user && root.user.deleteAccount(),

    publishChannel: (root, { url, title, description, tags }) =>
      root.user && Channels.publish({ url, title, description, tags }, root.user),
    updateChannel: (root, { id }) =>
      root.user && Channels.update(id, root.user),
    joinChannel: (root, { id }) =>
      root.user && Channels.join(id, root.user),
    abandonChannel: (root, { id }) =>
      root.user && Channels.abandon(id, root.user),

    async remember(root, { channel, content, kind }) {
      if (root.user) {
        const memory = await Posts.create(root.user.id, channel, content, kind);
        pubsub.publish('memory', { memory });
      }
    },
    async forget(root, { id }) {
      if (root.user) {
        const forget = await Posts.forget(id, root.user);
        pubsub.publish('memory', { forget });
      }
    },
  },
  Subscription: {
    uptime: { subscribe: () => pubsub.asyncIterator(['timer']) },
    moments: {
      // resolve: (moments, args) => {
      //   // console.log(payload);
      //   return { data: { moments } };
      // },
      subscribe: withFilter(() => pubsub.asyncIterator(['memory']),
        ({ moments: { channel } }, variables) => {
          // console.log(channel, variables);
          return channel === variables.channel;
        }),
    },
    channel: {
      // resolve: (payload, args) => payload,
      subscribe: withFilter(() => pubsub.asyncIterator('broadcast'),
        (payload, variables, ctx) => payload.to === ctx.user.id),
    },
  },
  Author: {
    id(root) { return root.id; },
    email(root) { return root.email; },
    handle(root) { return root.handle || null; },
    avatar(root) { return root.avatar || null; },
  },
  Channel: {},
  Moment: {},
  Post: {},
};

setInterval(() => pubsub.publish('timer', {
  uptime: Math.floor(process.uptime()),
}), 1000);
setInterval(() => pubsub.publish('memory', {
  moments: { id: 'adsgsg', by: 'o8dyvos', channel: '345235' },
}), 3000);

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
  logger: { log: e => console.log(e) },
  allowUndefinedInResolve: true,
});
