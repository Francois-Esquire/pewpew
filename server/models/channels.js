const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
  handle: String,
  avatar: String,
}, { _id: false });

const ChannelSchema = new mongoose.Schema({
  by: String,
  url: String,
  title: String,
  description: String,
  members: [AuthorSchema],
});

ChannelSchema.statics = {
  search(limit) {},
  publish(url, title, user) {},
  update(id, user) {},
  delete(id, user) {},
};

ChannelSchema.methods = {};

const Channel = mongoose.model('Channel', ChannelSchema);

module.exports = Channel;
