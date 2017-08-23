const { join } = require('path');
const webpack = require('webpack');
const GzipCompressionPlugin = require('compression-webpack-plugin');
const BrotliCompressionPlugin = require('brotli-webpack-plugin');
const FaviconGenerator = require('favicons-webpack-plugin');

const config = require('../config');

const targetPath = join(process.cwd(), 'dist');

module.exports = [{
  context: process.cwd(),
  devtool: 'source-map',
  entry: {
    vendor: config.src.vendor,
  },
  resolve: {
    modules: ['node_modules'],
  },
  output: {
    filename: 'dll/[name].[hash].js',
    path: targetPath,
    library: '[name]',
    libraryTarget: 'commonjs-module',
    sourceMapFilename: 'dll/[filebase].map',
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
    }),
    new FaviconGenerator({
      logo: config.src.favicon,
      prefix: 'icons/',
      title: 'Pew Pew',
      background: '#fff',
      inject: false,
      emitStats: true,
      statsFilename: 'icons/icons.json',
      persistentCache: true,
      icons: {
        android: true,
        appleIcon: true,
        appleStartup: false,
        coast: false,
        favicons: true,
        firefox: true,
        opengraph: false,
        twitter: false,
        yandex: false,
        windows: false,
      },
    }),
    new GzipCompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|css)$/,
      threshold: 12800,
      minRatio: 0.8,
    }),
    new BrotliCompressionPlugin({
      asset: '[path].br[query]',
      test: /\.(js|css|svg)$/,
      threshold: 12800,
      minRatio: 0.8,
    })],
}];
