const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const { sign, verify } = require('../helpers/jwt');

const TokenSchema = require('./schema/token');
const EmailSchema = require('./schema/email');

const UserSchema = new mongoose.Schema({
  avatar: String,
  password: String,
  handle: {
    type: String,
    trim: true,
    minlength: 1,
    lowercase: true,
    unique: true,
    sparse: true,
    required: true,
  },
  email: EmailSchema,
  services: [TokenSchema],
});

UserSchema.pre('save', function save(next) {
  const user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) next(err);
      else {
        bcrypt.hash(user.password, salt, null, (error, hash) => {
          if (error) { return next(err); }
          user.password = hash;
          return next();
        });
      }
    });
  } else next();
});

UserSchema.statics = {
  findUser({ email, handle, token }) {
    if (token) return this.findByToken(token);
    return this.findOne({ $or: [{ handle }, { 'email.address': email }] });
  },
  findByToken(access) {
    // return this.findOne({ 'services.access': access });
    return this.findOne({ services: { $elemMatch: { access } } });
  },
  join(handle) {
    const User = this;
    const user = new User({ handle });
    return user.signToken({
      name: 'join',
      method: 'login',
    });
  },
  async createUser(handle, address, password) {
    const User = this;
    const user = new User({ handle, email: { address }, password });
    const token = await user.generateVerification();
    const { access } = await user.signToken({
      name: 'create',
      method: 'login',
    });

    return { token, access, user };
  },
  async loginUser(handle, email, password) {
    const user = await this.findUser({ handle, email });
    if (user) {
      if (await user.comparePassword(password)) {
        return user.signToken({
          name: 'auth',
          method: 'login',
        });
      } return new Error('Invalid Credentials');
    } return new Error('User Not Found');
  },
  async verifyEmail(token, email) {
    const user = await this.findUser({ email });
    if (user) return user.verifyEmail(token);
    return new Error('User Not Found');
  },
  async recoverAccount(token, password) {
    const user = await this.findByToken(token);
    if (user) return user.recoverAccount(token, password);
    return new Error('User Not Found');
  },
  async generateVerification(email, handle) {
    const user = await this.findUser({ email, handle });
    if (user) return user.generateVerification();
    return new Error('User Not Found');
  },
  async generateRecovery(email, handle) {
    const user = await this.findUser({ email, handle });
    if (user) return user.generateRecovery();
    return new Error('User Not Found');
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
  async changeEmail(_id, email) {
    const user = await this.findById(_id);
    return user && user.changeEmail(email);
  },
  async changeAvatar(_id, avatar) {
    const user = await this.findById(_id);
    return user && user.changeAvatar(avatar);
  },
  async deleteAccount(_id, password) {
    const user = await this.findById(_id);
    return user && user.deleteAccount(password);
  },
};

UserSchema.methods = {
  async signToken({
    method = 'access',
    service,
  }) {
    const secret = config.secrets.get(method);

    const issued = new Date();
    const expires = new Date();
    const access = await sign({
      id: this.id,
    }, secret);

    const token = {
      method,
      access,
      issued,
      expires,
    };

    if (service) token.service = service;

    this.services.push(token);

    return { user: await this.save(), access };
  },
  async digestToken(token, method) {
    const secret = config.secrets.get(method);

    await verify(token, secret);
    this.services = this.services.filter(
      ({ access }) => access !== token);

    return this.save();
  },
  async verifyEmail(token) {
    await this.digestToken(token, 'verify');
    await this.email.verify();
    return true;
  },
  async recoverAccount(token, password) {
    await this.digestToken(token, 'restore');
    this.password = password;
    await this.save();
    return true;
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
    this.services = this.services.reduce((services, next) => {
      if (next.access === access) return services;
      return services.concat(next);
    }, []);
    await this.save();
    return true;
  },
  async setPassword(password) {
    this.password = password;
    await this.save();
    return this;
  },
  async changePassword(oldPassword, password) {
    const isMatch = await this.comparePassword(oldPassword);
    if (isMatch) {
      await this.setPassword(password);
      return true;
    }
    return new Error('Wrong password');
  },
  async changeHandle(handle) {
    this.handle = handle;
    await this.save();
    return true;
  },
  async changeEmail(email) {
    this.email.address = email;
    await this.save();
    return true;
  },
  async changeAvatar(avatar) {
    this.avatar = avatar;
    await this.save();
    return true;
  },
  async deleteAccount(password) {
    if (await this.comparePassword(password)) {
      await this.remove();
      return true;
    }
    return false;
  },
  comparePassword(candidatePassword) {
    return new Promise((resolve, reject) =>
      bcrypt.compare(candidatePassword, this.password,
        (error, isMatch) => { if (error) reject(error); else resolve(isMatch); }));
  },
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
