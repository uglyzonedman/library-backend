const path = require('path');

module.exports = {
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  env: {
    es2021: true,
    node: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    babelOptions: {
      configFile: path.resolve(__dirname, 'babel.config.cjs'),
    },
  },
  plugins: ['import'],
  rules: {},
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', '/src'],
      },
    },
  },
};
