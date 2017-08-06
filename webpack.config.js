const { join } = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const FaviconGenerator = require('favicons-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GzipCompressionPlugin = require('compression-webpack-plugin');
const BrotliCompressionPlugin = require('brotli-webpack-plugin');

const pkg = require('./package.json');
const config = require('./config');

const debug = process.env.NODE_ENV !== 'production';

const vendor = [
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
  'subscriptions-transport-ws'];

const resolve = {
  modules: ['node_modules'],
  descriptionFiles: ['package.json'],
  extensions: ['*', '.js', '.es', '.jsx', '.json', '.gql', '.css'],
};

const resolveLoader = {
  modules: ['node_modules', 'util'],
  moduleExtensions: ['-loader'],
};

const exclude = /node_modules/;
const rules = {
  gql: {
    test: /\.(graphql|gql)$/,
    loader: 'graphql-tag/loader',
    exclude,
  },
  js: {
    test: /\.(es|es6|js|jsx)$/,
    loader: 'babel',
    exclude,
  },
  json: {
    test: /\.json$/,
    loader: 'json',
    exclude,
  },
  url: {
    test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
    loader: 'url-loader',
    options: {
      limit: 10000,
    },
  },
};

const commonPlugins = [
  new webpack.optimize.ModuleConcatenationPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(debug ? 'development' : 'production'),
  }),
  new webpack.LoaderOptionsPlugin({
    debug,
    minimize: true,
    options: {
      context: __dirname,
    },
  })];

const plugins = commonPlugins.concat([
  new webpack.optimize.CommonsChunkPlugin({
    names: ['vendor', 'manifest'],
  }),
  new FaviconGenerator({
    logo: `${__dirname}/assets/images/pewpew.svg`,
    prefix: 'icons/',
    title: 'Pew Pew',
    inject: false,
    emitStats: true,
    statsFilename: 'stats/icons.json',
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
  new BundleAnalyzerPlugin({
    analyzerMode: debug ? 'server' : 'static',
    analyzerHost: '127.0.0.1',
    analyzerPort: 3001,
    reportFilename: `${__dirname}/dist/stats/report.html`,
    defaultSizes: 'parsed',
    openAnalyzer: false,
    generateStatsFile: !debug,
    statsFilename: `${__dirname}/dist/stats/bundle.json`,
    statsOptions: null,
    logLevel: 'info',
  })]);

const extractCSS = !debug && new ExtractTextWebpackPlugin({
  filename: 'css/[name].[hash].css',
  allChunks: true,
});

rules.css = {
  test: /\.css$/,
  use: debug ? [
    'style',
    {
      loader: 'css',
      options: {
        importLoaders: 1,
      },
    },
    'postcss',
  ] : extractCSS.extract({
    fallback: 'style',
    use: [{
      loader: 'css',
      options: {
        importLoaders: 1,
      },
    }, 'postcss'],
  }),
};

if (debug) {
  plugins.push(
    new webpack.HotModuleReplacementPlugin());
} else {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      parallel: true,
      uglifyOptions: {
        ecma: 5,
        mangle: true,
        compress: !debug && {
          booleans: true,
          comparisons: true,
          conditionals: true,
          dead_code: true,
          drop_debugger: true,
          drop_console: true,
          hoist_funs: true,
          unused: true,
        },
        output: {
          beautify: debug,
          quote_style: 1,
        },
      },
      sourceMap: true,
      warningsFilter: () => false,
    }),
    // new webpack.DllReferencePlugin({
    //   context: process.cwd(),
    //   manifest: require(join(config.paths.dll, 'vendor.json')),
    // }),
    // new CopyWebpackPlugin([{ from: config.paths.dll, to: `${config.paths.dist}/public/js/` }], { ignore: ['*.json'] }),
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
    }),
    extractCSS);
}

module.exports = {
  resolve,
  resolveLoader,
  plugins,
  devtool: debug ? 'cheap-module-eval-source-map' : 'source-map',
  name: 'app',
  target: 'web',
  context: __dirname,
  entry: {
    vendor,
    client: (debug ?
      ['webpack-hot-middleware/client?path=__hmr&timeout=2000&name=app', 'react-hot-loader/patch'] :
      []).concat(join(config.paths.src, 'index.js')),
  },
  output: {
    filename: debug ? '[name].[hash].js' : 'js/[name].[hash].js',
    chunkFilename: debug ? '[name].[hash].js' : 'js/[name].[chunkhash].js',
    sourceMapFilename: 'maps/[name].[chunkhash].js.map',
    hotUpdateChunkFilename: 'hot.[hash].js',
    hotUpdateMainFilename: 'hot-update.[hash].json',
    path: join(config.paths.dist, 'public'),
    publicPath: `${config.protocol}${config.host}`,
  },
  module: {
    rules: [rules.json, rules.url, rules.css, rules.gql, {
      test: /\.(es|es6|js|jsx)$/,
      use: ([{
        loader: 'babel',
      }]).concat(debug ? [] : [{
        loader: 'rollup',
        options: {
          exports: 'default',
          onwarn: () => false,
          external:
            id => (/\.(css|gql|png|jpg|jpeg|gif|svg|eot|ttf|woff|woff2)/.test(id) || !!pkg.dependencies[id]),
          plugins: [
            require('rollup-plugin-replace')({
              'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            }),
            require('rollup-plugin-node-resolve')({
              main: true,
              jsnext: true,
              browser: true,
              extensions: ['.js', '.jsx'],
            }),
            require('rollup-plugin-buble')({
              transforms: {
                generator: false,
                letConst: false,
                arrow: true,
                classes: true,
                modules: false,
                templateString: false,
                spreadRest: true,
                destructuring: true,
                parameterDestructuring: true,
                defaultParameter: true,
                collections: false,
                computedProperty: false,
                conciseMethodProperty: true,
                reservedProperties: false,
                numericLiteral: false,
                constLoop: false,
                forOf: false,
                dangerousForOf: true,
                dangerousTaggedTemplateString: true,
                stickyRegExp: true,
                unicodeRegExp: true,
              },
              jsx: 'React.createElement',
              objectAssign: 'Object.assign',
              namedFunctionExpressions: false,
            }),
            require('rollup-plugin-commonjs')({
              ignoreGlobal: true,
              exclude: 'node_modules/**',
            }),
            require('rollup-plugin-cleanup')({
              maxEmptyLines: 0,
            })],
        },
      }]),
      exclude,
    }],
  },
};
