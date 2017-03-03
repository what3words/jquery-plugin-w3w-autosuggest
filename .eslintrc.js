module.exports = {
  extends: 'standard',
  plugins: [
    'standard',
    'promise'
  ],
  rules: {
    'camelcase': 0,
    'quotes': [1, 'single'],
    'semi': [1, 'always']
  },
  env: {
    browser: true,
    node: true
  }

};
