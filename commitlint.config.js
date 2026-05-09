module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['fix', 'feat', 'refactor', 'chore', 'test', 'docs', 'style', 'perf', 'ci', 'build', 'revert']],
    'subject-max-length': [2, 'always', 72],
  },
};
