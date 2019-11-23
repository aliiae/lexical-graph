module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'airbnb-typescript/base',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'class-methods-use-this': 1,
    'no-underscore-dangle': 1,
    '@typescript-eslint/no-var-requires': 1,
    'no-param-reassign': 1,
  },
};
