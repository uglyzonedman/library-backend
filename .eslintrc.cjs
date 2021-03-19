const path = require('path');

module.exports = {
  extends: 'eslint:recommended',
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    babelOptions: {
      configFile: path.resolve(__dirname, '.babelrc.cjs'),
    },
  },
  plugins: ['prettier', 'import'],
  env: {
    node: true,
  },
  rules: {},
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', '/src'],
      },
    },
  },
};
