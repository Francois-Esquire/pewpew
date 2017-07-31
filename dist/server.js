'use strict';

var http = require('http');
var mongoose = require('mongoose');
var gridfsStream = require('gridfs-stream');
var jsonwebtoken = require('jsonwebtoken');
var validator = require('validator');
var bcryptNodejs = require('bcrypt-nodejs');
var graphql = require('graphql');
var graphqlServerKoa = require('graphql-server-koa');
var subscriptionsTransportWs = require('subscriptions-transport-ws');
var apolloLocalQuery = require('apollo-local-query');
var graphqlTools = require('graphql-tools');
var graphqlSubscriptions = require('graphql-subscriptions');
var koa = require('koa');
var koaRouter = require('koa-router');
var koaHelmet = require('koa-helmet');
var koaSession = require('koa-session');
var koaBodyparser = require('koa-bodyparser');
var koaSend = require('koa-send');
var koaMulter = require('koa-multer');
var koaFavicon = require('koa-favicon');
var multerGridfsStorage = require('multer-gridfs-storage');
var microseconds = require('microseconds');

const ID = mongoose.Schema.Types.ObjectId;
const NotificationSchema = new mongoose.Schema({
  to: String,
  content: String,
  viewed: [{ id: ID, when: Number }],
  priority: {
    type: String,
    enum: {
      message: 'enum validator failed for path `{PATH}` with value `{VALUE}`',
      values: ['PROMPT', 'ALERT', 'URGENT']
    },
    default: 'PROMPT'
  },
  subject: {
    type: String,
    enum: {
      message: 'enum validator failed for path `{PATH}` with value `{VALUE}`',
      values: ['TICKET', 'ASSIGNMENT', 'MESSAGE', 'APPLICATION', 'ANNOUNCEMENT']
    }
  },
  action: {
    type: String,
    enum: {
      message: 'enum validator failed for path `{PATH}` with value `{VALUE}`',
      values: ['RECEIVED', 'NOTIFIED', 'APPLIED', 'RESOLVED']
    }
  },
  issued: Number
}, {
  skipVersioning: !0
});
NotificationSchema.pre('save', function (next) {
  return this.isNew && (this.issued = Date.now()), next();
}), NotificationSchema.virtual('note', {
  get() {
    const { subject, action, content } = this;
    return `${subject}:${action}:${content}`;
  }
}), NotificationSchema.statics = {
  findNotesByUser(to) {
    this.find({ to });
  },
  async createNote(to, subject, action, content) {
    const Note = this;
    const notify = await new Note({ to, subject, action, content }).save();
    return notify;
  }
}, NotificationSchema.methods = {
  markRead() {
    return this.viewed = Date.now(), this.save();
  }
};
const Notification = mongoose.model('Notification', NotificationSchema);

const ID$1 = mongoose.Schema.Types.ObjectId;
const MessageSchema = new mongoose.Schema({
  by: {
    type: ID$1,
    ref: 'User',
    required: !0
  },
  thread: {
    type: ID$1,
    ref: 'Thread',
    required: !0
  },
  content: {
    type: String,
    required: !0,
    minlength: 1,
    trim: !0
  },
  draft: Boolean,
  edited: [Number]
}, {
  toObject: {
    getters: !1,
    virtuals: !0
  }
});
MessageSchema.virtual('createdAt').get(function () {
  return this._id.getTimestamp();
}), MessageSchema.pre('save', function (next) {
  if (this.isModified('content') && !this.isNew) {
    const now = Date.now();
    this.edited ? this.edited.push(now) : this.edited = [now];
  }
  return next();
}), MessageSchema.statics = {
  findMessage(id) {
    return this.findById(id);
  },
  findByThread(thread) {
    return this.find({ thread });
  },
  findByUserId(by) {
    return this.find({ by });
  },
  async checkOwnership(by, id) {
    const msg = await this.findMessage(id);
    return msg.by === by ? msg : new Error('Unauthorized');
  },
  async create(by, thread, content) {
    const Msg = this;
    const msg = await new Msg({ by, thread, content }).save();
    return msg;
  },
  async edit(id, content) {
    const msg = await this.findMessage(id);
    return msg.edit(content);
  },
  async erase(id) {
    const doc = await this.findByIdAndRemove(id);
    return doc;
  }
}, MessageSchema.methods = {
  async edit(content) {
    return this.content = content, await this.save(), this;
  },
  async erase() {
    const msg = this.toObject();
    return await this.remove(), msg;
  }
};
const Message = mongoose.model('Message', MessageSchema);

const AuthorSchema = new mongoose.Schema({
  handle: String,
  avatar: String
}, { _id: !1 });
const FlagSchema = new mongoose.Schema({
  guests: Boolean
}, { _id: !1 });
const ChannelSchema = new mongoose.Schema({
  by: String,
  url: String,
  title: String,
  description: String,
  members: [AuthorSchema],
  authors: [AuthorSchema],
  moderators: [AuthorSchema],
  flags: [FlagSchema],
  private: Boolean
});
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
    required: !0,
    trim: !0,
    minlength: 1,
    lowercase: !0,
    unique: !0,
    validate: {
      validator: email => validator.isEmail(email),
      message: '{VALUE} is not a valid email.'
    }
  },
  avatar: String
});
UserSchema.pre('save', function (next) {
  const user = this;
  return user.isModified('password') ? void bcryptNodejs.genSalt(10, (err, salt) => {
    return err ? next(err) : void bcryptNodejs.hash(user.password, salt, null, (err, hash) => {
      return err ? next(err) : void (user.password = hash, next());
    });
  }) : next();
}), UserSchema.statics = {
  setPassword(_id, password) {
    return this.findById(_id).then(user => user.setPassword(password));
  },
  changePassword(_id, { pass, word }) {
    return this.findById(_id).then(user => user.changePassword(oldPassword, password));
  },
  changeHandle(_id, handle) {
    return this.findById(_id).then(user => user.changeHandle(handle));
  },
  changeEmail(_id, email) {
    return this.findById(_id).then(user => user.changeEmail(email));
  }
}, UserSchema.methods = {
  comparePassword(candidatePassword) {
    return new Promise((resolve, reject) => bcryptNodejs.compare(candidatePassword, this.password, (error, isMatch) => error ? reject(error) : resolve(isMatch)));
  },
  setPassword(password) {
    return this.password = password, this.save();
  },
  changePassword(oldPassword, password) {
    const user = this;
    return new Promise((resolve, reject) => user.comparePassword(oldPassword).then(isMatch => isMatch ? user.password = password && user.save(error => error ? reject(error) : resolve(user)) : reject(new Error('Wrong password.'))).catch(reject));
  },
  changeEmail(email) {
    return new Promise((resolve, reject) => {
      return this.email = email, this.save(error => error ? reject(error) : resolve(this));
    });
  },
  changeHandle(handle) {
    return new Promise((resolve, reject) => {
      return this.handle = handle, this.save(error => error ? reject(error) : resolve(this));
    });
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

const schema$2 = `scalar URL

interface Node {
  id: ID!
}

interface User {
  handle: String
  avatar: URL
  channels: [Channel]
  moments: [Moment]
}

type Author implements Node, User {
  id: ID!
  handle: String
  avatar: URL
  channels: [Channel]
  moments: [Moment]
  email: String
}

type Contributor implements User {
  handle: String
  avatar: URL
  channels: [Channel]
  moments: [Moment]
}

interface Element {
  id: ID!
  by: ID!
  flags: [Flag]
  audience: Audience
}

type Audience {
  # if scoped, only the author and contributor can see any form of contribution
  scoped: Boolean
}

type Flag {
  id: ID!
  by: ID!
  reasons: [Flags]
}

enum Flags {
  NSFW
  HAZARD
  INAPPROPRIATE
  COPYRIGHT
  SENSITIVE
  PLAGERISM
  MALWARE
  SPAM
}

# Libraries -
# Applets - diagrams, surveys
# Bots -

interface Space {
  id: ID!
  by: ID!
  title: String
  description: String
  anchors: [String]
  flags: [Flag]
  moments: [Moment]
  members: [Author]
  authors: [Author]
  moderators: [Author]
  extensions: [Extensions]
  preference: Preferences
  audience: Audience
}

type Preferences {
  #invite-only, members can be shown or not - or depends on user prefs.
  # private channels can allow voyeurs and also allow requests to join.
  private: Boolean
  voyeurs: Boolean
  requests: Boolean
  extensions: [Extensions]
  types: [Types]
}

type Channel implements Space {
  id: ID!
  by: ID!
  url: URL! #consider reserved urls and site urls
  title: String
  description: String
  anchors: [String]
  flags(
    filter: [Flags]
    ): [Flag]
  # members and authors cannot upgrade, but authors and moderators can step down.
  # only owner can reclaim.
  members: [Author]
  authors: [Author]
  moderators: [Author]
  extensions: [Extensions]
  preference: Preferences
  audience: Audience
  # currently online
  streams: Int
  branches: [Branch]
  present: [Author]
  moments(
    limit: Int = 64,
    types: [Types]
    ): [Moment]
}

# branches start and end with a hash tag (# branch #)
type Branch implements Space {
  channel: ID!
  id: ID!
  by: ID!
  title: String
  description: String
  anchors: [String]
  flags: [Flag]
  moments: [Moment]
  members: [Author]
  authors: [Author]
  moderators: [Author]
  extensions: [Extensions]
  preference: Preferences
  audience: Audience
}

interface Moment {
  id: ID!
  by: ID!
  flags: [Flag]
  audience: Audience
  context: Contexts!
  type: Types!
  content: Content!
  # markers: Marking
}

type Marking {
  created: Int
  deleted: Int
  edited: Int
  # coords
  position: [Float]
  # movement in physical space
  # depending on media type, creates a timeline of movement
  trail: [Float]
}

type Content {
  media: ID
  file: ID
  text: String
  url: URL
  event: Events
  reaction: Reactions
  extension: Extension
}

type Extension {
  module: Extensions
}

enum Contexts {
  SPACE
  CHANNEL
  ELEMENT
  MOMENT
}

enum Events {
  EVT
}

enum Extensions {
  STREAM
  HALOGRAM
  DATAGRAM
  SURVEY
  MORSE
  QUIZ
  BOT
}

enum Types {
  TEXT
  IMAGE
  VIDEO
  AUDIO
  LINK
  FILE
  EXTENSION
  REACTION
  EVENT
  SPACE
}

enum Reactions {
  PEW
  PEWPEW
  PEWPEWPEW
  SHARE
  HEART
  LIKE
  INPUT
  CHAR
}

type Post implements Moment {
  id: ID!
  by: ID!
  flags: [Flag]
  audience: Audience
  context: Contexts!
  type: Types!
  content: Content!
  # markers: Marker

  id: ID!
  by: ID!
  flags: [Flag]
  type: Types!
  content: Content!
  doc: ID!
  reactions: Int
  private: Boolean
}

enum Services {
  facebook
  google
  github
  twitter
}

type Query {
  tasks: [String]
  me: Author
  author(
    id: ID
    ): Author
  channels(
    ids: [ID]
    limit: Int
    ): [Channel]
  # moments(): [Moment]
}

type Mutation {
  join(
    handle: String!
    channel: ID
    ): Contributor
  signup(
    email: String!
    handle: String!
    password: String!
    ): Author
  login(
    user: String!
    password: String!
    ): Author
  logout(
    session: String
    ): Author
  # verifyEmail(): Author
  # recoverAccount(): Author
  # signPassword(): Author
  # changePassword(): Author
  # changeHandle(): Author
  # changeEmail(): Author
  # deleteAccount(): Author

  publishChannel(
    url: String!
    title: String
    ): Channel
  # updateChannel(): Channel
  # releaseChannel(): Channel

  # remember(): Moment
  # forget(): Moment

  decorateElement(
    id: ID
    # reactions to moment / chennel / branch / author
    ): Element
  raiseFlag(
    # target # id - moment / chennel / branch / author
    flag: [Flags]
    ): Flag
}

type Subscription {
  moments(
    channels: [ID]
    ): Moment
  channel(
    id: ID!
    branches: [ID]
    moments: [ID]
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
const Messages = mongoose.model('Message');
const Notifications = mongoose.model('Notification');
const pubsub = new PubSub();
['publish', 'subscribe', 'unsubscribe', 'asyncIterator'].forEach(key => {
  pubsub[key] = pubsub[key].bind(pubsub);
});
const typeDefs = [schemaIndex];
const resolvers = {
  URL: {},
  Query: {
    tasks: root => root.tasks.concat('graphql'),
    me: root => root.user
  },
  Mutation: {
    async signup(root, args) {
      const { email, password } = args;
      const user = await Users.createUser(email, password);
      return user.format('session', { method: 'signup' });
    }
  },
  Subscription: {
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
  Moment: {}
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
  host = 'localhost:3000',
  port = 3000,
  path = '/graphql',
  subscriptionPath = path
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
      formatError: error => {
        return console.log('graphql format error: ', error), error;
      },
      formatResponse: response => {
        console.log('graphql response', response);
        const { session } = ctx;
        const { login, signup, resetAccount, logout } = response.data;
        const sessionResponse = login || signup || resetAccount;
        return sessionResponse ? session.token = sessionResponse.id : logout && (session.token = null), response;
      },
      debug
    })),
    graphiql: debug && graphiqlKoa({
      endpointURL: path,
      subscriptionsEndpoint: subscriptionPath || `ws://${host}${path}`
    }),
    createSubscriptionServer(options = {}) {
      const { server, keepAlive = 1000 } = options;
      return SubscriptionServer.create({
        schema: schema$$1,
        execute,
        subscribe,
        keepAlive
      }, server ? {
        server,
        path
      } : {
        host,
        port,
        path
      });
    }
  };
};

var app = function ({
  keys,
  routes,
  middleware,
  context,
  debug
}) {
  const app = new koa();
  const router = new koaRouter();
  app.keys = keys, Object.assign(app.context, context), routes && routes.forEach(route => route.verbs.forEach(verb => router[verb](route.path, route.use)));
  const upload = koaMulter({
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
  });
  return router.use(async (ctx, next) => {
    console.log('path: ', ctx.path, ' status: ', ctx.status), await next();
  }).get('/ping', async ctx => {
    ctx.body = 'pong';
  }).get('/favicon.ico', async ctx => {
    ctx.res.statusCode = 204;
  }).get(/^\/content\/(.*)\.(.*)/, async ctx => {
    const fileId = ctx.params[0];
    const ext = ctx.params[1];
    const file = await ctx.db.gfs.findOne({ _id: fileId, filename: `${fileId}.${ext}` });
    !file && (ctx.res.statusCode = 204, ctx.body = 'file could not be found.');
    const { _id, contentType, filename } = file;
    ctx.set('Content-Type', contentType), ctx.set('Content-Disposition', `attachment; filename="${filename}"`), ctx.body = ctx.db.gfs.createReadStream({ _id }), ctx.body.on('error', err => {
      console.log('Got error while processing stream ', err.message), ctx.res.end();
    });
  }).post('/uploads', upload.single('file'), async ctx => {
    ctx.res.statusCode = 200;
  }).get('/*', async (ctx, next) => {
    if (!/text\/html/.test(ctx.headers.accept)) return next();
    const networkInterface = await ctx.localInterface(ctx);
    const { css, scripts, manifest } = ctx.assets;
    return await ctx.render(ctx, {
      css,
      scripts,
      manifest,
      networkInterface
    }), next();
  }), middleware && middleware.forEach(ware => app.use(ware)), app.use(koaHelmet()).use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      ctx.body = `There was an error. Please try again later.\n\n${e.message}`;
    }
  }).use(async (ctx, next) => {
    const start = microseconds.now();
    await next();
    const end = microseconds.parse(microseconds.since(start));
    const total = end.microseconds + end.milliseconds * 1e3 + end.seconds * 1e6;
    ctx.set('Response-Time', `${total / 1e3}ms`);
  }).use(koaFavicon(`${process.cwd()}/dist/public/icons/favicon.ico`)).use(koaSession({
    key: 'persona',
    maxAge: 86400000,
    overwrite: !0,
    httpOnly: !0,
    signed: !0,
    rolling: !1
  }, app), async (ctx, next) => {
    return ctx.session.parcel = 'parcel', ctx.state.token = ctx.cookies.get('token') || ctx.headers.authorization, next();
  }).use(async (ctx, next) => {
    try {
      if (ctx.path !== '/') {
        const root = `${process.cwd()}${/^\/(images)\//.test(ctx.path) ? '/assets' : '/dist/public'}`;
        await koaSend(ctx, ctx.path, { root, immutable: !debug });
      }
    } catch (e) {                              }
    await next();
  }).use(koaBodyparser()).use(router.routes()).use(router.allowedMethods()), app;
};

var index = async function ({
  port,
  db: db$$1,
  assets,
  webpack,
  debug
}) {
  const routes = [];
  const middleware = [];
  const context = {};
  debug ? (webpack && (context.webpack = webpack, middleware.push(webpack.middleware)), context.db = db$$1) : context.db = await db({ debug }), context.render = require('./render'), context.helpers = helpers, context.assets = assets;
  const {
    graphql: graphql$$1,
    graphiql,
    localInterface,
    createSubscriptionServer
  } = graphql$1({ debug });
  graphql$$1 && (routes.push({
    path: '/graphql',
    verbs: ['get', 'post'],
    use: graphql$$1
  }), localInterface && (context.localInterface = localInterface), graphiql && routes.push({
    path: '/graphiql',
    verbs: ['get'],
    use: graphiql
  }));
  const app$$1 = app({
    keys: ['ssssseeeecret', 'ssshhhhhhhhh'],
    routes,
    middleware,
    context,
    debug
  });
  const server = http.createServer(app$$1.callback());
  return server.listen(port, () => {
    console.log(`listening on port: ${port}`), createSubscriptionServer({ server });
  }), { server, app: app$$1 };
};

module.exports = index;
