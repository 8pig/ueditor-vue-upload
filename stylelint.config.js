module.exports = {
  ignoreFiles: ['**/*.js', 'src/assets/', 'theme/'],
  extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
  rules: {
    'no-empty-source': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['extend']
      }
    ]
  }
};
