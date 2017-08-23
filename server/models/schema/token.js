const mongoose = require('mongoose');

const jwt = require('../../helpers/jwt');

const AuthSchema = new mongoose.Schema({
  name: String,
  access: String,
  refresh: String,
}, {
  _id: false,
  skipVersioning: true,
});

const TokenSchema = new mongoose.Schema({
  name: String,
  method: String,
  access: String,
  issued: Date,
  expires: Date,
  service: AuthSchema,
  options: Object,
}, {
  _id: false,
  skipVersioning: true,
});

TokenSchema.methods = {
  async refreshToken(options = {}) {
    const access = this.access;
    const secret = config.secrets.get(this.method);
    const token = await jwt.refresh(access, secret, options);

    return token;
  },
};

TokenSchema.statics = {
  async signToken({
    name = 'auth',
    method = 'login',
    service,
    payload,
    options,
  }) {
    const Token = this;
    const secret = config.secrets.get(method);

    const issued = new Date();
    const expires = new Date();
    const access = await jwt.sign(payload, secret, options);

    const token = {
      name,
      method,
      access,
      issued,
      expires,
      options,
    };

    if (service) token.service = service;

    const t = await new Token(token).save();

    return t;
  },
};

module.exports = TokenSchema;
