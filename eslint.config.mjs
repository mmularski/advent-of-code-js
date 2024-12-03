import globals from 'globals';
import js from '@eslint/js';
import * as tseslint from 'typescript-eslint';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import * as prettier from 'eslint-config-prettier';
import jestPlugin from 'eslint-plugin-jest';

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config([
  {
    files: ['{src}/**/*.{js,mjs,cjs,ts}'],
    ignores: ['**/.history/**'],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier,
      unicorn: eslintPluginUnicorn,
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...jestPlugin.environments.globals.globals,
      },
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
