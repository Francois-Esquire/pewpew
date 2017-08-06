'use strict';

var http = require('http');
var mongoose = require('mongoose');
var jsonwebtoken = require('jsonwebtoken');
var gridfsStream = require('gridfs-stream');
var validator = require('validator');
var bcryptNodejs = require('bcrypt-nodejs');
var graphql = require('graphql');
var graphqlServerKoa = require('graphql-server-koa');
var subscriptionsTransportWs = require('subscriptions-transport-ws');
var apolloLocalQuery = require('apollo-local-query');
var graphqlTools = require('graphql-tools');
var graphqlSubscriptions = require('graphql-subscriptions');
var koa = require('koa');
var koaSubdomain = require('koa-subdomain');
var koaRouter = require('koa-router');
var koaHelmet = require('koa-helmet');
var koaSession = require('koa-session');
var koaBodyparser = require('koa-bodyparser');
var koaSend = require('koa-send');
var koaMulter = require('koa-multer');
var koaFavicon = require('koa-favicon');
var multerGridfsStorage = require('multer-gridfs-storage');
var microseconds = require('microseconds');
var fs = require('fs');

var helpers = {
  async getUser(token, secret) {
    if (!token || !secret) return { user: null, token: null };
    try {
      const decodedToken = jsonwebtoken.verify(token.replace(/^JWT\s{1,}/, ''), secret);
      const user = await mongoose.model('User').findOne({ _id: decodedToken.sub });
      return { user, token };
    } catch (err) {
      return { user: null, token };
    }
  }
};

const PostSchema = new mongoose.Schema({
  by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: !0
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: !0
  },
  content: {
    type: String,
    required: !0,
    minlength: 1,
    trim: !0
  },
  kind: {
    type: String,
    required: !0,
    enum: {
      message: '`{VALUE}` is not a valid `{PATH}`.',
      values: ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'LINK']
    }
  }
}, {
  toObject: {
    getters: !1,
    virtuals: !0
  }
});
PostSchema.virtual('createdAt').get(function () {
  // eslint-disable-next-line no-underscore-dangle
  return this._id.getTimestamp();
}), PostSchema.statics = {
  findMessage(id) {
    return this.findById(id);
  },
  findByChannel(channel) {
    return this.find({ channel });
  },
  findByUserId(by) {
    return this.find({ by });
  },
  async create(by, channel, content, kind) {
    const Moment = this;
    const moment = await new Moment({ by, channel, content, kind }).save();
    return moment;
  },
  async forget(id, user) {
    const moment = await this.findMessage(id);
    return !(moment.by !== user.id) && (moment.remove(), !0);
  }
};
const Post = mongoose.model('Post', PostSchema);

const ChannelSchema = new mongoose.Schema({
  by: mongoose.Schema.Types.ObjectId,
  url: String,
  title: String,
  description: String,
  tags: [String],
  members: [mongoose.Schema.Types.ObjectId],
  maintainers: [mongoose.Schema.Types.ObjectId],
  private: {
    type: Boolean,
    default: !1
  }
});
ChannelSchema.pre('save', function (next) {
  const channel = this;
  return channel.isNew && (!channel.members && (channel.members = []), !channel.maintainers && (channel.maintainers = []), channel.maintainers.push(channel.by)), next();
}), ChannelSchema.statics = {
  search(count, tags = []) {
    return this.limit(count).find({
      $and: [{ private: !1 }, { $in: { tags } }]
    });
  },
  async publish({ url, title, description, tags }, user) {
    const Channel = this;
    const channel = await new Channel({
      by: user.id,
      url,
      title,
      description,
      tags
    }).save();
    return channel;
  },
  async update(id, user) {
    const channel = await this.findOne(id);
    if (channel) {
      const maintainer = channel.maintainers.indexOf(user.id);
      if (maintainer >= 0) return await channel.save(), !0;
    }
    return !1;
  },
  async join(id, user) {
    const channel = await this.findOne(id);
    if (channel && !channel.private) {
      const member = channel.members.indexOf(user.id);
      const maintainer = channel.maintainers.indexOf(user.id);
      if (member < 0 || maintainer < 0) return channel.members.push(user.id), await channel.save(), !0;
    }
    return !1;
  },
  async abandon(id, user) {
    const channel = await this.findOne(id);
    if (channel) {
      const maintainer = channel.maintainers.indexOf(user.id);
      if (maintainer >= 0) return channel.members.length ? (channel.maintainers.splice(maintainer, 1), await channel.save()) : await channel.remove(), !0;
    }
    return !1;
  }
}, ChannelSchema.methods = {};
const Channel = mongoose.model('Channel', ChannelSchema);

const UserSchema = new mongoose.Schema({
  password: String,
  handle: {
    type: String,
    trim: !0,
    minlength: 1,
    lowercase: !0,
    unique: !0,
    sparse: !0
  },
  email: {
    type: String,
    trim: !0,
    minlength: 1,
    lowercase: !0,
    unique: !0,
    sparse: !0,
    validate: {
      validator: email => validator.isEmail(email),
      message: '{VALUE} is not a valid email.'
    }
  },
  avatar: String
});
UserSchema.pre('save', function (next) {
  const user = this;
  user.isModified('password') ? bcryptNodejs.genSalt(10, (err, salt) => {
    return err ? next(err) : void bcryptNodejs.hash(user.password, salt, null, (err, hash) => {
      return err ? next(err) : void (user.password = hash, next());
    });
  }) : next();
}), UserSchema.statics = {
  join() {},
  createUser() {},
  login() {},
  setPassword(_id, password) {
    return this.findById(_id).then(user => user.setPassword(password));
  },
  changePassword(_id, { pass, word }) {
    return this.findById(_id).then(user => user.changePassword(pass, word));
  },
  changeHandle(_id, handle) {
    return this.findById(_id).then(user => user.changeHandle(handle));
  },
  changeEmail(_id, email) {
    return this.findById(_id).then(user => user.changeEmail(email));
  },
  deleteAccount(_id) {
    return this.findById(_id).then(user => user.deleteAccount());
  }
}, UserSchema.methods = {
  logout(ctx) {
    return ctx.session.token = null, !0;
  },
  async changePassword(oldPassword, password) {
    const isMatch = await this.comparePassword(oldPassword);
    return isMatch ? (this.password = password, await this.save(), !0) : new Error('Wrong password.');
  },
  async changeHandle(handle) {
    return this.handle = handle, await this.save(), !0;
  },
  async changeEmail(email) {
    return this.email = email, await this.save(), !0;
  },
  async deleteAccount() {
    return await this.remove(), !0;
  },
  comparePassword(candidatePassword) {
    return new Promise((resolve, reject) => bcryptNodejs.compare(candidatePassword, this.password, (error, isMatch) => error ? reject(error) : resolve(isMatch)));
  }
};
const User = mongoose.model('User', UserSchema);

mongoose.Promise = global.Promise;
var db = async ({ debug, uri, options }) => {
  const mongodbUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/pewpew';
  const mongodbOptions = options || {
    useMongoClient: !0,
    reconnectTries: Number.MAX_VALUE
  };
  debug && mongoose.set('debug', !0);
  const connection = await mongoose.connect(mongodbUri, mongodbOptions);
  const gfs = gridfsStream(connection.db, mongoose.mongo);
  return {
    connection,
    gfs
  };
};

const schema$2 = `scalar URL

interface Node {
  id: ID!
}

interface User {
  handle: String!
  avatar: URL
  channels: [Channel]
  moments(channel: ID): [Post]
}

type Author implements Node, User {
  id: ID!
  handle: String!
  avatar: URL
  channels: [Channel]
  moments(channel: ID): [Post]
  email: String
}

type Contributor implements Node, User {
  id: ID!
  handle: String!
  avatar: URL
  channels: [Channel]
  moments(channel: ID): [Post]
}

type Channel implements Node {
  id: ID!
  by: ID!
  url: URL!
  title: String
  description: String
  tags: [String]
  members: [Contributor]
  present: Int
  private: Boolean
  moments(
    limit: Int = 64,
    kinds: [Types]
    ): [Post]
}

interface Moment {
  id: ID!
  by: ID!
  kind: Types!
  content: String!
}

enum Types {
  TEXT
  IMAGE
  VIDEO
  AUDIO
  LINK
}

type Post implements Moment {
  id: ID!
  by: ID!
  kind: Types!
  content: String!
  reactions: [Post]
  channel: ID!
}

type Query {
  tasks: [String]
  me: Author
  author(
    id: ID
    ): Contributor
  channel(
    id: ID
    ): Channel
  channels(
    limit: Int = 16
    ): [Channel]
}

type Mutation {
  join(
    handle: String!
    ): Contributor
  signup(
    email: String!
    handle: String!
    password: String!
    ): Author
  login(
    handle: String!
    password: String!
    ): Author
  logout(
    session: String
    ): Boolean
  changePassword(
    pass: String!
    word: String!
    ): Boolean
  changeHandle(
    handle: String!
    ): Boolean
  changeEmail(
    email: String!
    ): Boolean
  deleteAccount: Boolean

  publishChannel(
    url: String!
    title: String
    description: String
    tags: [String]
    ): Channel
  updateChannel(
    id: ID!
    ): Boolean
  joinChannel(
    id: ID!
    ): Boolean
  abandonChannel(
    id: ID!
    ): Boolean

  remember(
    channel: String!
    content: String!
    kind: String!
    ): Moment
  forget(
    id: String!
    ): Moment
}

type Subscription {
  moments(
    channel: ID!
    ): Moment
  channel(
    id: ID!
    ): Channel
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`;


var index$2 = Object.freeze({
	default: schema$2
});

var schemaIndex = ( index$2 && schema$2 ) || index$2;

const { makeExecutableSchema } = graphqlTools;
const { withFilter, PubSub } = graphqlSubscriptions;
const Users = mongoose.model('User');
const Channels = mongoose.model('Channel');
const Posts = mongoose.model('Post');
const pubsub = new PubSub();
['publish', 'subscribe', 'unsubscribe', 'asyncIterator'].forEach(key => {
  pubsub[key] = pubsub[key].bind(pubsub);
});
const typeDefs = [schemaIndex];
const resolvers = {
  URL: {},
  Query: {
    tasks: root => root.tasks.concat('graphql'),
    me: root => root.user,
    author: async (root, args) => {
      const { id } = args;
      const user = await Users.findOne(id);
      return user;
    },
    channel: async (root, { id }) => Channels.findOne(id),
    channels: async (root, { limit }) => Channels.search(limit)
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
    logout: (root, args, ctx) => root.user && root.user.logout(ctx),
    changePassword: (root, { pass, word }) => root.user && root.user.changePassword(pass, word),
    changeHandle: (root, { handle }) => root.user && root.user.changeHandle(handle),
    changeEmail: (root, { email }) => root.user && root.user.changeEmail(email),
    deleteAccount: root => root.user && root.user.deleteAccount(),
    publishChannel: (root, { url, title, description, tags }) => root.user && Channels.publish({ url, title, description, tags }, root.user),
    updateChannel: (root, { id }) => root.user && Channels.update(id, root.user),
    joinChannel: (root, { id }) => root.user && Channels.join(id, root.user),
    abandonChannel: (root, { id }) => root.user && Channels.abandon(id, root.user),
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
    }
  },
  Subscription: {
    moments: {
      subscribe: withFilter(() => pubsub.asyncIterator('memory'), ({ messenger: { payload } }, variables) => payload.channel === variables.channel)
    },
    channel: {
      subscribe: withFilter(() => pubsub.asyncIterator('broadcast'), (payload, variables, ctx) => payload.to === ctx.user.id)
    }
  },
  Author: {
    id(root) {
      return root.id;
    },
    email(root) {
      return root.email;
    },
    handle(root) {
      return root.handle || null;
    },
    avatar(root) {
      return root.avatar || null;
    }
  },
  Channel: {},
  Moment: {},
  Post: {}
};
var schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  logger: { log: e => console.log(e) },
  allowUndefinedInResolve: !0
});

const { execute, subscribe } = graphql;
const { graphqlKoa, graphiqlKoa } = graphqlServerKoa;
const { SubscriptionServer } = subscriptionsTransportWs;
const { createLocalInterface } = apolloLocalQuery;
var graphql$1 = function ({
  debug,
  host,
  port,
  hrefs
}) {
  const schema$$1 = schema;
  const getRootValue = async ctx => Object.assign({
    tasks: ['hey', 'there']
  }, (await ctx.helpers.getUser(ctx.state.token)));
  return {
    localInterface: async ctx => createLocalInterface({ execute }, schema$$1, { rootValue: await getRootValue(ctx), context: ctx }),
    graphql: graphqlKoa(async ctx => ({
      schema: schema$$1,
      rootValue: await getRootValue(ctx),
      context: ctx,
      debug
    })),
    graphiql: graphiqlKoa({
      endpointURL: hrefs.graphql,
      subscriptionsEndpoint: hrefs.graphqlSub
    }),
    createSubscriptionServer(server, options = {}) {
      const { keepAlive = 1000 } = options;
      return SubscriptionServer.create({
        schema: schema$$1,
        execute,
        subscribe,
        keepAlive
      }, server ? {
        server
      } : {
        host,
        port
      });
    }
  };
};

var app = function ({
  gql: { graphql: graphql$$1, graphiql },
  keys,
  routes,
  middleware,
  context,
  domains,
  debug
}) {
  const app = new koa();
  const router = new koaRouter();
  app.keys = keys, app.subdomainOffset = 1, Object.assign(app.context, context);
  const api = new koaSubdomain().use(domains.graphql, new koaRouter().get(`/${domains.graphiql}`, graphiql).post('*', graphql$$1).routes());
  const content = new koaSubdomain().use(domains.content, new koaRouter().get(/^(.*)\.(.*){3,4}$/, async ctx => {
    const id = ctx.params[0];
    const ext = ctx.params[1];
    const file = await ctx.db.gfs.findOne({ id, filename: `${id}.${ext}` });
    !file && (ctx.status = 204, ctx.body = 'file could not be found.');
    const { _id, contentType, filename } = file;
    ctx.set('Content-Type', contentType), ctx.set('Content-Disposition', `attachment; filename="${filename}"`), ctx.body = ctx.db.gfs.createReadStream({ _id }), ctx.body.on('error', err => {
      console.log('Got error while processing stream ', err.message), ctx.res.end();
    });
  }).routes());
  const uploads = new koaSubdomain().use(domains.upload, new koaRouter().post('/*', koaMulter({
    storage: new multerGridfsStorage({
      gfs: context.db.gfs,
      metadata: (req, file, cb) => {
        cb(null, file);
      },
      root: (req, file, cb) => cb(null, null)
    }),
    fileFilter(req, file, cb) {
      cb(null, !0);
    },
    limits: {
      files: 1
    },
    preservePath: !0
  }).single('file'), async ctx => {
    ctx.res.statusCode = 200;
  }).routes());
  return routes && routes.forEach(route => route.verbs.forEach(verb => router[verb](route.path, route.use))), middleware && middleware.forEach(ware => app.use(ware)), app.use(koaHelmet()).use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      ctx.status = 500, ctx.body = `There was an error. Please try again later.\n\n${e.message}`;
    }
  }).use(async (ctx, next) => {
    const start = microseconds.now();
    await next();
    const end = microseconds.parse(microseconds.since(start));
    const total = end.microseconds + end.milliseconds * 1e3 + end.seconds * 1e6;
    ctx.set('Response-Time', `${total / 1e3}ms`);
  }).use(koaFavicon(`${process.cwd()}/dist/public/icons/favicon.ico`)).use(async (ctx, next) => {
    try {
      if (ctx.path !== '/') {
        const root = `${process.cwd()}${/^\/(images)\//.test(ctx.path) ? '/assets' : '/dist/public'}`;
        await koaSend(ctx, ctx.path, { root, immutable: !debug });
      }
    } catch (e) {                              }
    await next();
  }).use(koaSession({
    key: 'persona',
    maxAge: 86400000,
    overwrite: !0,
    httpOnly: !0,
    signed: !0,
    rolling: !1
  }, app), async (ctx, next) => {
    return ctx.session.parcel = 'parcel', ctx.state.token = ctx.cookies.get('token') || ctx.headers.authorization, next();
  }).use(koaBodyparser()).use(api.routes()).use(content.routes()).use(uploads.routes()).use(router.routes()).use(router.allowedMethods()), app;
};

var index = async function ({
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
  debug = !1,
  webpack,
  db: db$$1
}) {
  const routes = [];
  const middleware = [];
  const context = {
    helpers: helpers,
    domains,
    redis
  };
  debug ? (webpack && (context.webpack = webpack, middleware.push(webpack.middleware)), context.db = db$$1) : context.db = await db({ debug });
  const {
    graphql: graphql$$1,
    graphiql,
    localInterface,
    createSubscriptionServer
  } = graphql$1({ debug, protocol, domain: domains.graphql, host, port, hrefs });
  routes.push({
    path: '/*',
    verbs: ['get'],
    use: async (ctx, next) => {
      return (/text\/html/.test(ctx.headers.accept) ? (await render(ctx, Object.assign({}, assets, {
          hrefs,
          networkInterface: await localInterface(ctx)
        })), next()) : next()
      );
    }
  }), middleware.push(async (ctx, next) => {
    ctx.set({ Allow: 'GET, POST' }), await next();
  });
  const app$$1 = app({
    gql: { graphql: graphql$$1, graphiql },
    keys,
    paths,
    routes,
    middleware,
    context,
    domains,
    debug
  });
  const server = http.createServer(app$$1.callback());
  // eslint-disable-next-line camelcase
  return server.listen(unix_socket || port, () => {
    unix_socket ? (console.log(`app is listening on unix socket: ${unix_socket}`), fs.openSync('/tmp/app-initialized', 'w')) : console.log(`listening on port: ${port}`), createSubscriptionServer(server);
  }), { server, app: app$$1 };
};

module.exports = index;
