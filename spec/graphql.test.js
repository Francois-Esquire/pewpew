'use strict';

const { graphql } = require('graphql');
const { PubSub } = require('graphql-subscriptions');

const expect = require('expect');

before(async done => {
  await require('../server/db');
  done();
});

describe('GraphQL', () => {
  const schema = require('../server/schema');
});
