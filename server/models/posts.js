const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
  },
  content: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
  },
  kind: {
    type: String,
    required: true,
    enum: {
      message: '`{VALUE}` is not a valid `{PATH}`.',
      values: [
        'TEXT',
        'IMAGE',
        'VIDEO',
        'AUDIO',
        'LINK'],
    },
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
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
  async create(user, channel, content, kind) {
    const Moment = this;
    const moment = await new Moment({ by: user.id, channel, content, kind }).save();
    return moment;
  },
  async update(id, user, content, kind) {
    const Moment = this;
    // verify user is owner
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
      kind,
    }).save();
    return reaction;
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
