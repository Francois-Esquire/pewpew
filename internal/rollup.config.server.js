const cjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');
const babel = require('rollup-plugin-babel');
const cleanup = require('rollup-plugin-cleanup');

const gql = require('./plugins/rollup-plugin-graphql-language');

const pkg = require('../package.json');

const debug = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: 'server/index.js',
  targets: [{ dest: debug ? 'dist/server-dev.js' : 'dist/server.js', format: 'cjs' }],
  sourceMap: false,
  interop: false,
  external: Object.keys(pkg.dependencies).concat(['http']),
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    cjs({
      ignoreGlobal: true,
      exclude: 'node_modules/**',
      ignore: debug ? ['./db'] : [],
    }),
    gql({
      introspect: 'dist/schema.json',
      language: 'dist/schema.graphql',
    }),
    babel({
      babelrc: false,
      externalHelpers: false,
      presets: ['react', ['env', {
        debug: false,
        spec: true,
        modules: false,
        useBuiltIns: true,
        targets: {
          node: 'current',
        },
      }]],
      plugins: [
        'minify-simplify',
        'minify-dead-code-elimination',
        'transform-simplify-comparison-operators',
        'transform-undefined-to-void',
        'transform-minify-booleans',
        'check-es2015-constants',
        'transform-es2015-classes',
        'transform-es2015-duplicate-keys',
        'transform-es2015-for-of',
        'transform-es2015-function-name',
        'transform-es2015-literals',
        'transform-es2015-object-super',
        'transform-es2015-spread',
        'transform-es2015-sticky-regex',
        'transform-es2015-unicode-regex',
        'transform-object-rest-spread',
        'transform-class-properties',
        'transform-do-expressions'],
    }),
    cleanup({
      maxEmptyLines: 0,
      comments: ['eslint'],
    })],
};
