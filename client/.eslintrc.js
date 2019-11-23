module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb-typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    'react-hooks',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  rules: {
    'class-methods-use-this': 1,
    'no-underscore-dangle': 1,
    '@typescript-eslint/no-var-requires': 1,
    'arrow-body-style': 1,
    '@typescript-eslint/ban-ts-ignore': 1,
    'no-use-before-define': 1,
    'no-param-reassign': 1,
    'no-plusplus': 1,
  },
};
