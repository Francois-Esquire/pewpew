const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

mongoose.Promise = global.Promise;

require('./models/posts');
require('./models/channels');
require('./models/users');

module.exports = async (mongodbUri, { debug, options }) => {
  const mongodbOptions = options || {
    useMongoClient: true,
    reconnectTries: Number.MAX_VALUE,
  };

  mongoose.set('debug', debug);

  const connection = await mongoose.connect(mongodbUri, mongodbOptions);
  const gfs = Grid(connection.db, mongoose.mongo);

  return {
    connection,
    gfs,
  };
};
