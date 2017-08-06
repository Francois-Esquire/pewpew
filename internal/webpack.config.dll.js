const { join } = require('path');
const webpack = require('webpack');

const targetPath = join(process.cwd(), 'dist');

module.exports = [{
  context: process.cwd(),
  entry: {
    vendor: [
      'redux',
      'react',
      'react-dom',
      'react-apollo',
      'react-helmet',
      'react-modal',
      'react-router',
      'react-router-dom',
      'react-redux',
      'prop-types',
      'whatwg-fetch',
      'apollo-client',
      'subscriptions-transport-ws'],
  },
  resolve: {
    modules: ['node_modules'],
  },
  output: {
    filename: 'dll/[name].[hash].js',
    path: targetPath,
    library: '[name]',
    libraryTarget: 'commonjs-module',
  },
  module: {
    rules: [{
      test: /\.(es|es6|js|jsx)$/,
      use: [{
        loader: 'rollup-loader',
        options: {
          format: 'cjs',
          exports: ['named', 'default'],
          onwarn: () => false,
          plugins: [
            require('rollup-plugin-node-resolve')({
              jsnext: true,
              browser: true,
              extensions: ['.es', '.es6', '.js', '.jsx'],
            }),
            require('rollup-plugin-cleanup')({
              maxEmptyLines: 0,
            })],
        },
      }],
    }],
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DllPlugin({
      name: '[name]',
      path: join(targetPath, 'dll/[name].json'),
    })],
}];
