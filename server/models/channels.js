const mongoose = require('mongoose');

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
    default: false,
  },
});

ChannelSchema.pre('save', function save(next) {
  const channel = this;
  if (channel.isNew) {
    if (!channel.members) channel.members = [];
    if (!channel.maintainers) channel.maintainers = [];
    channel.maintainers.push(channel.by);
  }
  return next();
});

ChannelSchema.statics = {
  search(count, tags = []) {
    return this.limit(count).find({
      $and: [
        { private: false },
        { $in: { tags } }],
    });
  },
  async publish({ url, title, description, tags }, user) {
    const Channel = this;
    const channel = await new Channel({
      by: user.id,
      url,
      title,
      description,
      tags,
    }).save();
    return channel;
  },
  async update(id, user) {
    const channel = await this.findOne(id);
    if (channel) {
      const maintainer = channel.maintainers.indexOf(user.id);
      if (maintainer >= 0) {
        // perform update
        await channel.save();
        return true;
      }
    }
    return false;
  },
  async join(id, user) {
    const channel = await this.findOne(id);
    if (channel && !channel.private) {
      const member = channel.members.indexOf(user.id);
      const maintainer = channel.maintainers.indexOf(user.id);
      if (member < 0 || maintainer < 0) {
        channel.members.push(user.id);
        await channel.save();
        return true;
      }
    }
    return false;
  },
  async abandon(id, user) {
    const channel = await this.findOne(id);
    if (channel) {
      const maintainer = channel.maintainers.indexOf(user.id);
      if (maintainer >= 0) {
        if (channel.members.length) {
          channel.maintainers.splice(maintainer, 1);
          await channel.save();
        } else await channel.remove();
        return true;
      }
    }
    return false;
  },
};

ChannelSchema.methods = {};

const Channel = mongoose.model('Channel', ChannelSchema);

module.exports = Channel;
