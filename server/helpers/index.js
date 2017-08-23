const mongoose = require('mongoose');

const { verify } = require('./jwt');

module.exports = {
  async createLoaders(authToken) {
    return {
      // users: new DataLoader(ids => genUsers(authToken, ids)),
    };
  },
  async getRootValue(ctx) {
    return Object.assign({
      tasks: ['hey', 'there'],
    }, ctx ? await this.getUser(ctx, 'login') : {});
  },
  async getUser(ctx, method) {
    const { access } = ctx.state;

    if (access && method) {
      try {
        const token = await verify(access.replace(/^(Bearer|JWT)\s{1,}/, ''), config.secrets.get(method));
        const user = await mongoose.model('User').findOne({ _id: token.id });

        return { user, access: token };
      } catch (err) {
        return { user: null, access };
      }
    }
    return { user: null, access };
  },
};
