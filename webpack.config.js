const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const GzipCompressionPlugin = require('compression-webpack-plugin');
const BrotliCompressionPlugin = require('brotli-webpack-plugin');

const pkg = require('./package.json');
const config = require('./config');

const debug = config.debug;

const resolve = {
  modules: ['node_modules'],
  descriptionFiles: ['package.json'],
  extensions: ['*', '.js', '.es', '.jsx', '.json', '.gql', '.css'],
  alias: config.paths,
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
    loader: 'url',
    options: {
      limit: 10000,
    },
    exclude,
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

const cacheName = new Date().toISOString();
const plugins = commonPlugins.concat([
  new webpack.optimize.CommonsChunkPlugin({
    names: ['vendor', 'manifest'],
  }),
  // new webpack.DllReferencePlugin({
  //   context: process.cwd(),
  //   // eslint-disable-next-line import/no-dynamic-require
  //   manifest: require(`${config.paths.dll}/vendor.json`),
  // }),
  new CopyWebpackPlugin([
    // { from: config.paths.dll, to: `${config.paths.dist}/public/${debug ? '' : 'js/'}` },
    { from: `${config.paths.dist}/icons`, to: `${config.paths.dist}/public/icons/` }],
  { ignore: ['**/.*', '*.json', '*.map', '*.webapp'] }),
  new ServiceWorkerWebpackPlugin({
    entry: config.src.service,
    filename: 'workers/service-worker.js',
    excludes: ['**/.*', '**/*.map', 'icons/*.json', 'workers/*', 'hot*'],
    transformOptions(options) {
      return Object.assign(options, {
        CACHE_NAME: cacheName,
        assets: options.assets.filter((src) => {
          switch (true) {
            default: return true;
            case src.startsWith('hot'): return false;
            case src.startsWith('workers'): return false;
            case src.startsWith('icons'): return false;
          }
        }),
      });
    },
  }),
  new BundleAnalyzerPlugin({
    analyzerMode: debug ? 'server' : 'static',
    analyzerHost: '127.0.0.1',
    analyzerPort: 3001,
    reportFilename: config.src.stats.report,
    defaultSizes: 'parsed',
    openAnalyzer: false,
    generateStatsFile: !debug,
    statsFilename: config.src.stats.bundle,
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
        sourceMap: true,
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

// plugins.push(function writeManifestJson() {
//   const fs = require('fs');
//   const util = require('util');
//   // this.plugin('emit', (compilation, callback) => {
//   //   const compKeys = Object.keys(compilation);
//   //   // const assetKeys = util.inspect(compilation.assets[Object.keys(compilation.assets)[0]]);
//   //   const fsKeys = util.inspect(compilation.inputFileSystem.fileSystem);
//   //   // const fsJSONKeys = util.inspect(compilation.inputFileSystem._readJsonStorage);
//   //   console.log('\n\temit: ', compKeys, fsKeys);
//   //   // console.log(compilation.inputFileSystem._readJsonStorage());
//   //   callback();
//   // });
//   this.plugin('done', (stats) => {
//     const s = stats.toJson();
//     console.log(Object.keys(s));
//     console.log(s.assetsByChunkName);
//     console.log(s.assets);
//     // console.log(util.inspect(stats));
//     // fs.writeFileSync(config.src.manifest, JSON.stringify(stats.toJson()));
//   });
// });

module.exports = {
  resolve,
  resolveLoader,
  plugins,
  devtool: debug ? 'cheap-module-eval-source-map' : 'source-map',
  name: 'app',
  target: 'web',
  context: __dirname,
  entry: {
    vendor: config.src.vendor,
    client: config.src.client,
  },
  output: {
    filename: debug ? '[name].[hash].js' : 'js/[name].[hash].js',
    chunkFilename: debug ? '[name].[hash].js' : 'js/[name].[chunkhash].js',
    sourceMapFilename: 'maps/[filebase].map',
    hotUpdateChunkFilename: 'hot.[hash].js',
    hotUpdateMainFilename: 'hot-update.[hash].json',
    path: config.paths.public,
    publicPath: `${config.protocol}${config.host}${debug ? '/' : ''}`,
  },
  module: {
    // noParse: /apollo-client|graphql-tag/,
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
            id => (/\.(css|gql|png|jpg|jpeg|gif|svg|eot|ttf|woff|woff2)$/.test(id) ||
              id.startsWith('serviceworker-webpack-plugin') ||
              !!pkg.dependencies[id]),
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
