const resolve = require('rollup-plugin-node-resolve');

const mainConfig = require('./rollup.config.app');

mainConfig.plugins[1] = resolve({
  main: false,
  extensions: ['.js', '.jsx', '.gql'],
});

delete mainConfig.targets;

module.exports = Object.assign({}, mainConfig, {
  entry: 'src/render/render.js',
  dest: 'dist/render.js',
  format: 'cjs',
});
