const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

mongoose.Promise = global.Promise;

require('./models/posts');
require('./models/channels');
require('./models/users');

module.exports = async ({ debug, uri, options }) => {
  const mongodbUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/pewpew';
  const mongodbOptions = options || {
    useMongoClient: true,
    reconnectTries: Number.MAX_VALUE,
  };

  if (debug) mongoose.set('debug', true);

  const connection = await mongoose.connect(mongodbUri, mongodbOptions);
  const gfs = Grid(connection.db, mongoose.mongo);

  return {
    connection,
    gfs,
  };
};
