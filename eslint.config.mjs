import globals from 'globals';
import js from '@eslint/js';
import * as tseslint from 'typescript-eslint';
import * as prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config([
  {
    files: ['src/**/*.{js,mjs,cjs,ts}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
    ],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier
    },
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: false,
        },
      },
    },
    rules: {
      quotes: ['error', 'single'],
      'unicorn/prefer-node-protocol': 'error',
    },
  },
]);
