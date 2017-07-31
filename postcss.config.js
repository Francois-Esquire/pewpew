// eslint-disable-next-line import/no-extraneous-dependencies
const postcssNested = require('postcss-nested');
// eslint-disable-next-line import/no-extraneous-dependencies
const cssnext = require('postcss-cssnext');
// eslint-disable-next-line import/no-extraneous-dependencies
const cssnano = require('cssnano');
// eslint-disable-next-line import/no-extraneous-dependencies
const normalize = require('postcss-normalize')

module.exports = ctx => ({
  map: ctx.env === 'development' ? ctx.map : false,
  plugins: [
    cssnext(),
    postcssNested(),
    normalize({
      forceImport: true,
      browsers: 'last 4 versions',
    }),
    cssnano({
      autoprefixer: false,
    })],
});
