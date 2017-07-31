const mongoose = require('mongoose');

const ID = mongoose.Schema.Types.ObjectId;

const PostSchema = new mongoose.Schema({
  by: {
    type: ID,
    ref: 'User',
    required: true,
  },
  channel: {
    type: ID,
    ref: 'Thread',
    required: true,
  },
  content: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
  },
  kind: String,
}, {
  toObject: {
    getters: false,
    virtuals: true,
  },
});

PostSchema.virtual('createdAt').get(function createdAt() {
  // eslint-disable-next-line no-underscore-dangle
  return this._id.getTimestamp();
});

PostSchema.statics = {
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
    if (moment.by !== user.id) return false;
    moment.remove();
    return true;
  },
};

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
