const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

module.exports = {
  async getUser(token, secret) {
    if (!token || !secret) return { user: null, token: null };
    try {
      const decodedToken = jwt.verify(token.replace(/^JWT\s{1,}/, ''), secret);
      const user = await mongoose.model('User').findOne({ _id: decodedToken.sub });
      return { user, token };
    } catch (err) {
      return { user: null, token };
    }
  },
};
