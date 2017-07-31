'use strict';

const mongoose = require('mongoose');

const expect = require('expect');

before(async done => {
  await require('../server/db')({
    uri: 'mongodb://localhost:27017/pewpew-test',
  });
  done();
});

describe('MongoDB', () => {
  describe('Users', () => {
    const Users = mongoose.model('User');
  });

  describe('Channels', () => {
    const Channels = mongoose.model('Channel');
  });

  describe('Messages', () => {
    const Messages = mongoose.model('Message');
  });

  describe('Notifications', () => {
    const Notifications = mongoose.model('Notification');
  });
});
