const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');

const secretKey = 'catz';

const UserSchema = new mongoose.Schema({
  password: String,
  handle: {
    type: String,
    trim: true,
    minlength: 1,
    lowercase: true,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    trim: true,
    minlength: 1,
    lowercase: true,
    unique: true,
    sparse: true,
    validate: {
      validator: email => validator.isEmail(email),
      message: '{VALUE} is not a valid email.',
    },
  },
  avatar: String,
});

UserSchema.pre('save', function save(next) {
  const user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) { return next(err); }
      bcrypt.hash(user.password, salt, null, (err, hash) => {
        if (err) { return next(err); }
        user.password = hash;
        next();
      });
    });
  } else next();
});

UserSchema.statics = {
  join(handle, ctx) {},
  createUser(handle, ctx) {},
  login(handle, ctx) {},
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
  },
};

UserSchema.methods = {
  logout(ctx) {
    ctx.session.token = null;
    return true;
  },
  async changePassword(oldPassword, password) {
    const isMatch = await this.comparePassword(oldPassword);
    if (isMatch) {
      this.password = password;
      await this.save();
      return true;
    }
    return new Error('Wrong password.');
  },
  async changeHandle(handle) {
    this.handle = handle;
    await this.save();
    return true;
  },
  async changeEmail(email) {
    this.email = email;
    await this.save();
    return true;
  },
  async deleteAccount() {
    await this.remove();
    return true;
  },
  comparePassword(candidatePassword) {
    return new Promise((resolve, reject) => bcrypt.compare(candidatePassword, this.password,
      (error, isMatch) => error ? reject(error) : resolve(isMatch)));
  },
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
