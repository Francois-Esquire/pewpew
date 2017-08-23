const mongoose = require('mongoose');
const { makeExecutableSchema } = require('graphql-tools');
const { withFilter, PubSub } = require('graphql-subscriptions');

const Users = mongoose.model('User');
const Channels = mongoose.model('Channel');
const Posts = mongoose.model('Post');

const pubsub = new PubSub();

['publish', 'subscribe', 'unsubscribe', 'asyncIterator']
  .forEach((key) => { pubsub[key] = pubsub[key].bind(pubsub); });

const typeDefs = [require('../schema/index.graphql')];

const resolvers = {
  // Signature: {},
  // Payload: {},
  // Pulse: {},
  // Node: {},
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
    authors: async (root, args) => {
      const { channels = [] } = args;
      const authors = await Users.find({});
      print.log(authors[0].id);
      return authors;
    },
    channel: async (root, { id }) => Channels.findOne(id),
    channels: async (root, { limit }) => Channels.search(limit),
    moments: async (root, { channel }) => Posts.find({ channel }),
  },
  Mutation: {
    async join(root, args, ctx) {
      if (root.user) return { id: ctx.state.access, type: 'enlist' };
      const { handle } = args;
      const { access } = await Users.join(handle);

      // eslint-disable-next-line no-multi-assign
      ctx.session.access = ctx.state.access = access;

      return { id: access };
    },
    async signup(root, args, ctx) {
      if (root.user) return { id: ctx.state.access, type: 'signup' };
      const { handle, email, password } = args;
      const { access, token } = await Users.createUser(handle, email, password);

      // eslint-disable-next-line no-multi-assign
      ctx.session.access = ctx.state.access = access;

      await ctx.emails.sendEmail({
        to: email,
        from: `hey@${config.host}`,
        subject: 'Welcome To Pew Pew',
      }, { html: ctx.emails.renderWelcome(handle, token) });
      return { id: access };
    },
    async login(root, args, ctx) {
      if (root.user) return { id: ctx.state.access, type: 'login' };
      const { handle, email, password } = args;
      const { access } = await Users.loginUser(handle, email, password);

      // eslint-disable-next-line no-multi-assign
      ctx.session.access = ctx.state.access = access;

      return { id: access };
    },
    async logout(root, args, ctx) {
      if (root.user) {
        await root.user.logout(ctx.state.access);

        // eslint-disable-next-line no-multi-assign
        ctx.session.access = ctx.state.access = null;

        return true;
      } return false;
    },
    async sendVerification(root, { email, handle }, ctx) {
      if (root.user) ctx.state.token = await root.user.generateVerification();
      else ctx.state.token = await Users.generateVerification(email, handle);

      await ctx.emails.sendEmail({
        to: email,
        from: `support@${config.host}`,
        subject: 'Confirm Your Email',
      }, { html: ctx.emails.renderVerification(handle, ctx.state.token) });
      return true;
    },
    async sendRecovery(root, { email, handle }, ctx) {
      if (root.user) ctx.state.token = await root.user.generateRecovery();
      else ctx.state.token = await Users.generateRecovery(email, handle);

      await ctx.emails.sendEmail({
        to: email,
        from: `support@${config.host}`,
        subject: 'Recover Your Account',
      }, { html: ctx.emails.renderRecovery(handle, ctx.state.token) });
      return true;
    },
    verifyEmail(root, { token, email }) {
      if (root.user) return root.user.verifyEmail(token);
      return Users.verifyEmail(token, email);
    },
    recoverAccount(root, { token, pass, word }) {
      if (root.user) return true;
      else if (pass !== word) return false;
      return Users.recoverAccount(token, pass);
    },
    changePassword: (root, { pass, word }) =>
      root.user && root.user.changePassword(pass, word),
    changeHandle: (root, { handle }) =>
      root.user && root.user.changeHandle(handle),
    changeEmail: (root, { email }) =>
      root.user && root.user.changeEmail(email),
    changeAvatar: (root, { avatar }) =>
      root.user && root.user.changeAvatar(avatar),
    deleteAccount: (root, args) =>
      root.user && root.user.deleteAccount(args.password),

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
        const memory = await Posts.create(root.user, channel, content, kind);
        pubsub.publish('memory', { memory });
      }
    },
    async relive(root, { id, content, kind }) {
      if (root.user) {
        const relive = await Posts.update(id, root.user, content, kind);
        pubsub.publish('memory', { relive });
      }
    },
    async react(root, { id, content, kind }) {
      if (root.user) {
        const reaction = await Posts.react(id, root.user, content, kind);
        pubsub.publish('memory', { reaction });
      }
    },
    async forget(root, { id }) {
      if (root.user) {
        const forget = await Posts.forget(id, root.user);
        pubsub.publish('memory', { forget });
      } return false;
    },
  },
  Subscription: {
    uptime: { subscribe: () => pubsub.asyncIterator(['timer']) },
    channel: {
      subscribe: withFilter(() => pubsub.asyncIterator('broadcast'),
        (payload, variables, ctx) => payload.to === ctx.user.id),
    },
    channels: {
      subscribe: () => pubsub.asyncIterator('broadcast'),
    },
    moments: {
      // resolve: (moments, args) => {
      //   // console.log(payload);
      //   return { data: { moments } };
      // },
      subscribe: withFilter(() => pubsub.asyncIterator(['memory']),
        ({ moments: { channel } }, variables) => channel === variables.channel),
    },
  },
  Author: {
    id(root) { return root.id; },
    email(root) { return root.email.address; },
    handle(root) { return root.handle || null; },
    avatar(root) { return root.avatar || null; },
    moments(root) { return root.moments; },
    channels(root) { return root.channels; },
  },
  Channel: {
    // present(root) {
    //   // access redis with present users in channel
    //   const channelId = root.id;
    // },
    moments(root, args) {
      const { kinds } = args;
      return Posts.find({ $in: { kind: kinds || [] } });
    },
  },
  Moment: {
    reactions(root) {
      return Posts.find({ thread: root.id });
    },
  },
};

setInterval(() => pubsub.publish('timer', {
  uptime: Math.floor(process.uptime()),
}), 1000);
setInterval(() => pubsub.publish('memory', {
  moments: {
    action: 'moment.update',
    payload: { id: 'adsgsg', by: 'o8dyvos', channel: `${Date.now()}` },
  },
}), 3000);

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
  logger: { log: e => console.log(e) },
  allowUndefinedInResolve: true,
});
