module.exports = {
  extends: 'airbnb',
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    jsx: true,
  },
  env: {
    node: true,
    browser: true,
  },
  plugins: [
    'babel',
    'react',
    'import',
    'jsx-a11y',
    'compat',
    'graphql'],
  rules: {
    'jsx-a11y/href-no-hash': 0,
    'react/prefer-stateless-function': [1, { ignorePureComponents: true }],
    'react/no-multi-comp': 0,
    'react/jsx-closing-bracket-location': [1, 'after-props'],
    'react/prop-types': [1, { ignore: ['dispatch', 'data', 'match', 'location', 'history'] }],
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'linebreak-style': 1,
    'global-require': 0,
    'import/no-unresolved': [2, { commonjs: true }],
    'compat/compat': 2,
    'graphql/template-strings': ['error', {
      env: 'apollo',
      validators: 'all',
      schemaJson: require('./dist/schema.json'),
    }, {
      env: 'literal',
      validators: 'all',
      schemaJson: require('./dist/schema.json'),
    }],
  },
  settings: {
    'import/resolver': {
      node: {
        paths: [
          __dirname,
          'node_modules'],
      },
    },
  },
  globals: {
    SERVER: false,
  },
};
