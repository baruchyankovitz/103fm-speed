import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules', 'dist'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.browser, ...globals.webextensions }
    },
    rules: { 'no-empty': ['error', { allowEmptyCatch: true }] }
  },
  { files: ['src/content/media/**', 'src/content/player/**'], languageOptions: { sourceType: 'module' } },
  { files: ['eslint.config.js'], languageOptions: { sourceType: 'module', globals: globals.node } }
];
