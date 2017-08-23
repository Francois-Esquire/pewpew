'use strict';

var http = require('http');
var graphql = require('graphql');
var apolloLocalQuery = require('apollo-local-query');
var subscriptionsTransportWs = require('subscriptions-transport-ws');
var redis = require('redis');
var chalk = require('chalk');
var koa = require('koa');
var koaSubdomain = require('koa-subdomain');
var koaRouter = require('koa-router');
var kcors = require('kcors');
var koaHelmet = require('koa-helmet');
var koaSession = require('koa-session');
var koaBodyparser = require('koa-bodyparser');
var koaSend = require('koa-send');
var koaMulter = require('koa-multer');
var koaFavicon = require('koa-favicon');
var koaUseragent = require('koa-useragent');
var graphqlServerKoa = require('graphql-server-koa');
var multerGridfsStorage = require('multer-gridfs-storage');
var microseconds = require('microseconds');
var mongoose = require('mongoose');
var gridfsStream = require('gridfs-stream');
var bcryptNodejs = require('bcrypt-nodejs');
var jsonwebtoken = require('jsonwebtoken');
var validator = require('validator');
var graphqlTools = require('graphql-tools');
var graphqlSubscriptions = require('graphql-subscriptions');

const { graphqlKoa, graphiqlKoa } = graphqlServerKoa;
var app = function ({
  routes,
  middleware,
  context,
  schema,
  assets
}) {
  const app = new koa();
  const router = new koaRouter();
  app.keys = config.secrets.get('keys'), app.subdomainOffset = config.host.split('.').length, Object.assign(app.context, context);
  const gql = graphqlKoa(async ctx => ({
    schema,
    rootValue: await ctx.helpers.getRootValue(ctx),
    context: ctx,
    debug: config.debug
  }));
  const giql = graphiqlKoa({
    endpointURL: config.hrefs.graphql,
    subscriptionsEndpoint: config.hrefs.graphqlSub
  });
  routes.push({
    path: '/graphql',
    verbs: ['post'],
    use: gql
  }, {
    path: '/graphiql',
    verbs: ['get'],
    use: giql
  });
  const api = new koaSubdomain().use(config.domains.graphql, new koaRouter().get(`/${config.domains.graphiql}`, giql).post('*', gql).routes());
  const content = new koaSubdomain().use(config.domains.content, new koaRouter().get(/^(.*)\.(.*){3,4}$/, async ctx => {
    try {
      const id = ctx.params[0];
      const ext = ctx.params[1];
      const file = await ctx.db.gfs.findOne({ id, filename: `${id}.${ext}` });
      !file && (ctx.status = 204, ctx.body = 'file could not be found.');
      const { _id, contentType, filename } = file;
      ctx.set('Content-Type', contentType), ctx.set('Content-Disposition', `attachment; filename="${filename}"`), ctx.body = ctx.db.gfs.createReadStream({ _id }), ctx.body.on('error', err => {
        print.log('Got error while processing stream ', err.message), ctx.res.end();
      });
    } catch (e) {    }
  }).routes());
  const uploads = new koaSubdomain().use(config.domains.upload, new koaRouter().post('/*', koaMulter({
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
  }).single('file')).use(async ctx => {
    ctx.res.statusCode = 200;
  }).routes());
  return routes.forEach(route => route.verbs.forEach(verb => router[verb](route.path, route.use))), middleware.forEach(ware => app.use(ware)), app.use(async (ctx, next) => {
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
  }).use(kcors({
    allowMethods: ['GET'],
    credentials: !0,
    keepHeadersOnError: !0
  })).use(koaHelmet()).use(koaFavicon(config.paths.favicon)).use(koaSession({
    key: 'persona',
    maxAge: 86400000,
    overwrite: !0,
    httpOnly: !0,
    signed: !0,
    rolling: !1
  }, app)).use(koaUseragent).use(async (ctx, next) => {
    if (!/\.(ico|png|svg|css|js|json)$/.test(ctx.path)) await next();else if (assets.paths.indexOf(ctx.path) >= 0 && print.log(`\tmatching path: ${ctx.path}`), ctx.set('Service-Worker-Allowed', '/'), ctx.path === '/favicon.ico') ctx.status === 404 && (ctx.status = 204);else try {
          const root = /^\/(images)\//.test(ctx.path) ? config.paths.assets : config.paths.public;
          const immutable = !config.debug;
          await koaSend(ctx, ctx.path, { root, immutable });
        } catch (e) {    }
  }).use(async (ctx, next) => {
    typeof ctx.session.visits == 'number' ? ctx.session.visits += 1 : ctx.session.visits = 0, ctx.state.access = ctx.session.access || ctx.headers.authorization, await next();
  }).use(koaBodyparser()).use(api.routes()).use(content.routes()).use(uploads.routes()).use(router.routes()).use(router.allowedMethods()), app;
};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

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
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }
}, {
  toObject: {
    getters: !1,
    virtuals: !0
  }
});
PostSchema.virtual('createdAt').get(function () {
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
  async create(user, channel, content, kind) {
    const Moment = this;
    const moment = await new Moment({ by: user.id, channel, content, kind }).save();
    return moment;
  },
  async update(id, user, content, kind) {
    const Moment = this;
    const moment = await Moment.findOneAndUpdate({ id }, { $set: { content, kind } });
    return moment;
  },
  async react(id, user, content, kind) {
    const Moment = this;
    const moment = await Moment.findMessage(id);
    const reaction = await new Moment({
      by: user.id,
      channel: moment.channel,
      thread: moment.id,
      content,
      kind
    }).save();
    return reaction;
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
    return this.find({
      $and: [{ private: !1 }, { tags: { $in: tags } }]
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

function sign$1(payload, secret, options = {}) {
  return new Promise((resolve, reject) => jsonwebtoken.sign(payload, secret, Object.assign({}, config.jwt, {
    expiresIn: '60 days'
  }, options), (error, jwtToken) => {
    error ? reject(error) : resolve(jwtToken);
  }));
}
function verify$1(jwtToken, secret, options = {}) {
  return new Promise((resolve, reject) => jsonwebtoken.verify(jwtToken, secret, Object.assign({}, config.jwt, options), (error, payload) => {
    error ? reject(error) : resolve(payload);
  }));
}
function decode(jwtToken, options) {
  const payload = jsonwebtoken.decode(jwtToken, Object.assign({ complete: !0 }, options));
  return Promise.resolve(payload);
}
async function refresh(jwtToken, secret, options = {}) {
  const payload = await verify$1(jwtToken, secret, Object.assign({}, config.jwt, options.verify));
  payload.iat && delete payload.iat, payload.exp && delete payload.exp, payload.nbf && delete payload.nbf, payload.jti && delete payload.jti;
  const token = await sign$1(payload, secret, Object.assign({}, config.jwt, options.sign));
  return token;
}
var sign_1 = sign$1;
var verify_1 = verify$1;
var decode_1 = decode;
var refresh_1 = refresh;
var jwt_1 = {
  sign: sign_1,
  verify: verify_1,
  decode: decode_1,
  refresh: refresh_1
};

const AuthSchema = new mongoose.Schema({
  name: String,
  access: String,
  refresh: String
}, {
  _id: !1,
  skipVersioning: !0
});
const TokenSchema = new mongoose.Schema({
  name: String,
  method: String,
  access: String,
  issued: Date,
  expires: Date,
  service: AuthSchema,
  options: Object
}, {
  _id: !1,
  skipVersioning: !0
});
TokenSchema.methods = {
  async refreshToken(options = {}) {
    const access = this.access;
    const secret = config.secrets.get(this.method);
    const token = await jwt_1.refresh(access, secret, options);
    return token;
  }
}, TokenSchema.statics = {
  async signToken({
    name = 'auth',
    method = 'login',
    service,
    payload,
    options
  }) {
    const Token = this;
    const secret = config.secrets.get(method);
    const issued = new Date();
    const expires = new Date();
    const access = await jwt_1.sign(payload, secret, options);
    const token = {
      name,
      method,
      access,
      issued,
      expires,
      options
    };
    service && (token.service = service);
    const t = await new Token(token).save();
    return t;
  }
};
var token = TokenSchema;

const EmailSchema = new mongoose.Schema({
  address: {
    type: String,
    trim: !0,
    minlength: 5,
    lowercase: !0,
    unique: !0,
    sparse: !0,
    validate: {
      validator: email => validator.isEmail(email),
      message: '{VALUE} is not a valid email.'
    }
  },
  verified: Boolean
}, {
  _id: !1,
  skipVersioning: !0
});
EmailSchema.pre('save', function (next) {
  return (this.isNew || this.isModified('address')) && (this.verified = !1), next();
}), EmailSchema.methods = {
  verify() {
    return this.verified = !0, this.save();
  }
};
var email = EmailSchema;

const { sign, verify } = jwt_1;
const UserSchema = new mongoose.Schema({
  avatar: String,
  password: String,
  handle: {
    type: String,
    trim: !0,
    minlength: 1,
    lowercase: !0,
    unique: !0,
    sparse: !0,
    required: !0
  },
  email: email,
  services: [token]
});
UserSchema.pre('save', function (next) {
  const user = this;
  user.isModified('password') ? bcryptNodejs.genSalt(10, (err, salt) => {
    err ? next(err) : bcryptNodejs.hash(user.password, salt, null, (error, hash) => {
      return error ? next(err) : (user.password = hash, next());
    });
  }) : next();
}), UserSchema.statics = {
  findUser({ email: email$$1, handle, token: token$$1 }) {
    return token$$1 ? this.findByToken(token$$1) : this.findOne({ $or: [{ handle }, { 'email.address': email$$1 }] });
  },
  findByToken(access) {
    return this.findOne({ services: { $elemMatch: { access } } });
  },
  join(handle) {
    const User = this;
    const user = new User({ handle });
    return user.signToken({
      name: 'join',
      method: 'login'
    });
  },
  async createUser(handle, address, password) {
    const User = this;
    const user = new User({ handle, email: { address }, password });
    const token$$1 = await user.generateVerification();
    const { access } = await user.signToken({
      name: 'create',
      method: 'login'
    });
    return { token: token$$1, access, user };
  },
  async loginUser(handle, email$$1, password) {
    const user = await this.findUser({ handle, email: email$$1 });
    return user ? (await user.comparePassword(password)) ? user.signToken({
      name: 'auth',
      method: 'login'
    }) : new Error('Invalid Credentials') : new Error('User Not Found');
  },
  async verifyEmail(token$$1, email$$1) {
    const user = await this.findUser({ email: email$$1 });
    return user ? user.verifyEmail(token$$1) : new Error('User Not Found');
  },
  async recoverAccount(token$$1, password) {
    const user = await this.findByToken(token$$1);
    return user ? user.recoverAccount(token$$1, password) : new Error('User Not Found');
  },
  async generateVerification(email$$1, handle) {
    const user = await this.findUser({ email: email$$1, handle });
    return user ? user.generateVerification() : new Error('User Not Found');
  },
  async generateRecovery(email$$1, handle) {
    const user = await this.findUser({ email: email$$1, handle });
    return user ? user.generateRecovery() : new Error('User Not Found');
  },
  async setPassword(_id, password) {
    const user = await this.findById(_id);
    return user && user.setPassword(password);
  },
  async changePassword(_id, { pass, word }) {
    const user = await this.findById(_id);
    return user && user.changePassword(pass, word);
  },
  async changeHandle(_id, handle) {
    const user = await this.findById(_id);
    return user && user.changeHandle(handle);
  },
  async changeEmail(_id, email$$1) {
    const user = await this.findById(_id);
    return user && user.changeEmail(email$$1);
  },
  async changeAvatar(_id, avatar) {
    const user = await this.findById(_id);
    return user && user.changeAvatar(avatar);
  },
  async deleteAccount(_id, password) {
    const user = await this.findById(_id);
    return user && user.deleteAccount(password);
  }
}, UserSchema.methods = {
  async signToken({
    method = 'access',
    service
  }) {
    const secret = config.secrets.get(method);
    const issued = new Date();
    const expires = new Date();
    const access = await sign({
      id: this.id
    }, secret);
    const token$$1 = {
      method,
      access,
      issued,
      expires
    };
    return service && (token$$1.service = service), this.services.push(token$$1), { user: await this.save(), access };
  },
  async digestToken(token$$1, method) {
    const secret = config.secrets.get(method);
    return await verify(token$$1, secret), this.services = this.services.filter(({ access }) => access !== token$$1), this.save();
  },
  async verifyEmail(token$$1) {
    return await this.digestToken(token$$1, 'verify'), await this.email.verify(), !0;
  },
  async recoverAccount(token$$1, password) {
    return await this.digestToken(token$$1, 'restore'), this.password = password, await this.save(), !0;
  },
  async generateVerification() {
    const { access } = await this.signToken({ method: 'verify' });
    return access;
  },
  async generateRecovery() {
    const { access } = await this.signToken({ method: 'restore' });
    return access;
  },
  async logout(access) {
    return this.services = this.services.reduce((services, next) => {
      return next.access === access ? services : services.concat(next);
    }, []), await this.save(), !0;
  },
  async setPassword(password) {
    return this.password = password, await this.save(), this;
  },
  async changePassword(oldPassword, password) {
    const isMatch = await this.comparePassword(oldPassword);
    return isMatch ? (await this.setPassword(password), !0) : new Error('Wrong password');
  },
  async changeHandle(handle) {
    return this.handle = handle, await this.save(), !0;
  },
  async changeEmail(email$$1) {
    return this.email.address = email$$1, await this.save(), !0;
  },
  async changeAvatar(avatar) {
    return this.avatar = avatar, await this.save(), !0;
  },
  async deleteAccount(password) {
    return !!(await this.comparePassword(password)) && (await this.remove(), !0);
  },
  comparePassword(candidatePassword) {
    return new Promise((resolve, reject) => bcryptNodejs.compare(candidatePassword, this.password, (error, isMatch) => {
      error ? reject(error) : resolve(isMatch);
    }));
  }
};
const User = mongoose.model('User', UserSchema);

var db = createCommonjsModule(function (module) {
  mongoose.Promise = global.Promise, module.exports = async (mongodbUri, options) => {
    const mongodbOptions = options || {
      useMongoClient: !0,
      reconnectTries: Number.MAX_VALUE
    };
    mongoose.set('debug', config.debug);
    const connection = await mongoose.connect(mongodbUri, mongodbOptions);
    const gfs = gridfsStream(connection.db, mongoose.mongo);
    return {
      connection,
      gfs
    };
  };
});

const { verify: verify$2 } = jwt_1;
var helpers = {
  async createLoaders() {
    return {
    };
  },
  async getRootValue(ctx) {
    return Object.assign({
      tasks: ['hey', 'there']
    }, ctx ? await this.getUser(ctx, 'login') : {});
  },
  async getUser(ctx, method) {
    const { access } = ctx.state;
    if (access && method) try {
        const token = await verify$2(access.replace(/^(Bearer|JWT)\s{1,}/, ''), config.secrets.get(method));
        const user = await mongoose.model('User').findOne({ _id: token.id });
        return { user, access: token };
      } catch (err) {
        return { user: null, access };
      }
    return { user: null, access };
  }
};

const schemaLanguage = `scalar URL

enum Types {
  TEXT
  LINK
  IMAGE
  AUDIO
  VIDEO
  LIVE
}

interface Node {
  id: ID!
}

type Moment implements Node {
  id: ID!
  by: ID
  kind: Types
  content: String
  reactions: [Moment]
  channel: ID!
  thread: ID
}

interface User {
  handle: String!
  avatar: URL
  channels: [Channel]
  moments(channel: ID): [Moment]
}

type Author implements Node, User {
  id: ID!
  handle: String!
  avatar: URL
  channels: [Channel]
  moments(channel: ID): [Moment]
  email: String
}

type Contributor implements Node, User {
  id: ID!
  handle: String!
  avatar: URL
  channels: [Channel]
  moments(channel: ID): [Moment]
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
    ): [Moment]
}

type Signature {
  id: String
  type: String
}

union Payload = Channel | Moment | Contributor

type Pulse {
  action: String
  payload: Payload
}

type Query {
  tasks: [String]
  me(
    withChannels: Boolean = false
    withMoments: Boolean = false
    detailed: Boolean = false
    ): Author
  author(
    id: ID
    ): Contributor
  authors(
    channels: [ID]
    ): [Contributor]
  channel(
    id: ID,
    url: String
    ): Channel
  channels(
    limit: Int = 16
    ): [Channel]
  moments(
    channel: ID!
    limit: Int = 16
    withReactions: Boolean = false
    ): [Moment]
}

type Mutation {
  join(
    handle: String!
    ): Signature
  signup(
    email: String!
    handle: String!
    password: String!
    ): Signature
  login(
    email: String
    handle: String
    password: String!
    ): Signature
  logout(
    session: String
    ): Boolean
  sendRecovery(
    email: String
    handle: String
    ): Boolean
  sendVerification(
    email: String
    ): Boolean
  verifyEmail(
    token: String!
    email: String!
    ): Boolean
  recoverAccount(
    token: String!
    pass: String!
    word: String!
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
  changeAvatar(
    avatar: String!
    ): Boolean
  deleteAccount(
    password: String!
    ): Boolean

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
    channel: ID!
    content: String!
    kind: Types!
    ): Moment
  relive(
    id: ID!
    content: String!
    kind: Types!
    ): Moment
  react(
    id: ID!
    content: String!
    kind: Types!
    ): Moment
  forget(
    id: String!
    ): Boolean
}

type Subscription {
  uptime: Int
  topics(
    tags: [String]
    ): String
  channels: [Channel]
  channel(
    id: ID
    url: String
    ): Pulse
  moments(
    channel: ID!
    ): Pulse
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`;


var schema$2 = Object.freeze({
	default: schemaLanguage
});

var require$$2 = ( schema$2 && schemaLanguage ) || schema$2;

var schema = createCommonjsModule(function (module) {
  const { makeExecutableSchema } = graphqlTools;
  const { withFilter, PubSub } = graphqlSubscriptions;
  const Users = mongoose.model('User');
  const Channels = mongoose.model('Channel');
  const Posts = mongoose.model('Post');
  const pubsub = new PubSub();
  ['publish', 'subscribe', 'unsubscribe', 'asyncIterator'].forEach(key => {
    pubsub[key] = pubsub[key].bind(pubsub);
  });
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
      authors: async (root, args) => {
        const authors = await Users.find({});
        return print.log(authors[0].id), authors;
      },
      channel: async (root, { id }) => Channels.findOne(id),
      channels: async (root, { limit }) => Channels.search(limit),
      moments: async (root, { channel }) => Posts.find({ channel })
    },
    Mutation: {
      async join(root, args, ctx) {
        if (root.user) return { id: ctx.state.access, type: 'enlist' };
        const { handle } = args;
        const { access } = await Users.join(handle);
        return ctx.session.access = ctx.state.access = access, { id: access };
      },
      async signup(root, args, ctx) {
        if (root.user) return { id: ctx.state.access, type: 'signup' };
        const { handle, email, password } = args;
        const { access, token } = await Users.createUser(handle, email, password);
        return ctx.session.access = ctx.state.access = access, await ctx.emails.sendEmail({
          to: email,
          from: `hey@${config.host}`,
          subject: 'Welcome To Pew Pew'
        }, { html: ctx.emails.renderWelcome(handle, token) }), { id: access };
      },
      async login(root, args, ctx) {
        if (root.user) return { id: ctx.state.access, type: 'login' };
        const { handle, email, password } = args;
        const { access } = await Users.loginUser(handle, email, password);
        return ctx.session.access = ctx.state.access = access, { id: access };
      },
      async logout(root, args, ctx) {
        return !!root.user && (await root.user.logout(ctx.state.access), ctx.session.access = ctx.state.access = null, !0);
      },
      async sendVerification(root, { email, handle }, ctx) {
        return ctx.state.token = root.user ? await root.user.generateVerification() : await Users.generateVerification(email, handle), await ctx.emails.sendEmail({
          to: email,
          from: `support@${config.host}`,
          subject: 'Confirm Your Email'
        }, { html: ctx.emails.renderVerification(handle, ctx.state.token) }), !0;
      },
      async sendRecovery(root, { email, handle }, ctx) {
        return ctx.state.token = root.user ? await root.user.generateRecovery() : await Users.generateRecovery(email, handle), await ctx.emails.sendEmail({
          to: email,
          from: `support@${config.host}`,
          subject: 'Recover Your Account'
        }, { html: ctx.emails.renderRecovery(handle, ctx.state.token) }), !0;
      },
      verifyEmail(root, { token, email }) {
        return root.user ? root.user.verifyEmail(token) : Users.verifyEmail(token, email);
      },
      recoverAccount(root, { token, pass, word }) {
        if (root.user) return !0;
        return !(pass !== word) && Users.recoverAccount(token, pass);
      },
      changePassword: (root, { pass, word }) => root.user && root.user.changePassword(pass, word),
      changeHandle: (root, { handle }) => root.user && root.user.changeHandle(handle),
      changeEmail: (root, { email }) => root.user && root.user.changeEmail(email),
      changeAvatar: (root, { avatar }) => root.user && root.user.changeAvatar(avatar),
      deleteAccount: (root, args) => root.user && root.user.deleteAccount(args.password),
      publishChannel: (root, { url, title, description, tags }) => root.user && Channels.publish({ url, title, description, tags }, root.user),
      updateChannel: (root, { id }) => root.user && Channels.update(id, root.user),
      joinChannel: (root, { id }) => root.user && Channels.join(id, root.user),
      abandonChannel: (root, { id }) => root.user && Channels.abandon(id, root.user),
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
        }return !1;
      }
    },
    Subscription: {
      uptime: { subscribe: () => pubsub.asyncIterator(['timer']) },
      channel: {
        subscribe: withFilter(() => pubsub.asyncIterator('broadcast'), (payload, variables, ctx) => payload.to === ctx.user.id)
      },
      channels: {
        subscribe: () => pubsub.asyncIterator('broadcast')
      },
      moments: {
        subscribe: withFilter(() => pubsub.asyncIterator(['memory']), ({ moments: { channel } }, variables) => channel === variables.channel)
      }
    },
    Author: {
      id(root) {
        return root.id;
      },
      email(root) {
        return root.email.address;
      },
      handle(root) {
        return root.handle || null;
      },
      avatar(root) {
        return root.avatar || null;
      },
      moments(root) {
        return root.moments;
      },
      channels(root) {
        return root.channels;
      }
    },
    Channel: {
      moments(root, args) {
        const { kinds } = args;
        return Posts.find({ $in: { kind: kinds || [] } });
      }
    },
    Moment: {
      reactions(root) {
        return Posts.find({ thread: root.id });
      }
    }
  };
  setInterval(() => pubsub.publish('timer', {
    uptime: Math.floor(process.uptime())
  }), 1000), setInterval(() => pubsub.publish('memory', {
    moments: {
      action: 'moment.update',
      payload: { id: 'adsgsg', by: 'o8dyvos', channel: `${Date.now()}` }
    }
  }), 3000), module.exports = makeExecutableSchema({
    typeDefs: [require$$2],
    resolvers,
    logger: { log: e => console.log(e) },
    allowUndefinedInResolve: !0
  });
});

const { execute, subscribe } = graphql;
const { createLocalInterface } = apolloLocalQuery;
const { SubscriptionServer } = subscriptionsTransportWs;
var server = async function ({
  emails,
  render,
  assets,
  webpack
}) {
  const middleware = [];
  const routes = [];
  const context = {};
  context.db = await db(config.urls.mongo), context.redis = redis.createClient(config.urls.redis), context.helpers = helpers, context.email = emails, config.debug && webpack && middleware.push(webpack.middleware), middleware.push(async (ctx, next) => {
    ctx.set({ Allow: 'GET, POST' }), await next();
  }), routes.push({
    path: '/*',
    verbs: ['get'],
    use: async (ctx, next) => {
      /text\/html/.test(ctx.headers.accept) && (config.debug && ctx.state.webpackStats && ctx.state.webpackStats.hash !== assets.hash && Object.assign(assets, webpack.getAssets(ctx.state.webpackStats)), await render(ctx, Object.assign({}, assets, {
        hrefs: config.hrefs,
        networkInterface: createLocalInterface({ execute }, schema, {
          rootValue: await ctx.helpers.getRootValue(ctx), context: ctx
        })
      })), await next());
    }
  });
  const application = app({
    routes,
    middleware,
    context,
    schema,
    assets
  });
  const createSubscriptions = server => SubscriptionServer.create({
    schema,
    execute,
    subscribe,
    rootValue: {},
    onConnect: (params, ws) => {
      return print.log(chalk`\tonConnect params: {bold ${JSON.stringify(params)}}, sid: ${ws.sid}`), helpers.getUser(params.signature);
    },
    onDisconnect: ws => {
      print.log(chalk`\tsocket.id: {bold ${ws.sid}} disconnected`);
    },
    onOperationComplete: (ws, opId) => print.log(chalk`operation {bold ${opId || '(id)'} complete.}`),
    keepAlive: 1000
  }, { server });
  const server = http.createServer(application.callback());
  return server.listen(config.port, () => {
    return print.log(`
    ${chalk`\n\t{bold.green Server {yellow ${process.pid}} is running}`}
    ${chalk`\t{bold listening on port: {hex('ff8800').bold ${server.address().port}}}\n`}`), createSubscriptions(server), server.emit('listening');
  });
};

module.exports = server;
