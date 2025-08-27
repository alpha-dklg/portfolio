const tseslint = require('typescript-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');
const angular = require('@angular-eslint/eslint-plugin');
const templatePlugin = require('@angular-eslint/eslint-plugin-template');
const tsParser = require('@typescript-eslint/parser');

const angularRecommendedRules =
  (angular.configs && angular.configs.recommended && angular.configs.recommended.rules) || {};
const templateRecommendedRules =
  (templatePlugin.configs &&
    templatePlugin.configs.recommended &&
    templatePlugin.configs.recommended.rules) ||
  {};

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'docs/**', 'tmp/**', 'eslint.config.js'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@angular-eslint': angular,
      '@angular-eslint/template': templatePlugin,
      '@typescript-eslint': tseslint.plugin,
    },
    processor: '@angular-eslint/template/extract-inline-html',
    rules: {
      ...angularRecommendedRules,
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: require('@angular-eslint/template-parser'),
    },
    plugins: {
      '@angular-eslint/template': templatePlugin,
    },
    rules: {
      ...templateRecommendedRules,
    },
  },
  eslintConfigPrettier,
];
