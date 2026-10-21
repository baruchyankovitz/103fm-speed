import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules', 'dist'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.webextensions }
    },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
      'no-var': 'error',
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 12]
    }
  },
  { files: ['eslint.config.js', 'test/**'], languageOptions: { globals: globals.node } }
];
