import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

import { lintRulesPlugin, sourceFiles } from './lint-rules-plugin.js';

const javascriptFiles = ['**/*.{js,cjs,mjs}'];

const config = defineConfig([
    {
        name: '@codicus/ignores',
        ignores: ['**/coverage/**', '**/dist/**', '**/node_modules/**', '**/*.generated.*'],
    },
    {
        name: '@codicus/inline-config',
        linterOptions: {
            noInlineConfig: true,
            reportUnusedDisableDirectives: 'error',
        },
        rules: {
            'no-warning-comments': ['error', { location: 'start', terms: ['oxlint-disable', 'oxlint-enable'] }],
        },
    },
    {
        ...js.configs.recommended,
        name: '@codicus/javascript/recommended',
        files: javascriptFiles,
    },
    {
        name: '@codicus/lint-rules',
        files: sourceFiles,
        plugins: {
            codicus: lintRulesPlugin(),
        },
        rules: {
            'codicus/no-chained-type-assertions': 'error',
            'codicus/no-known-value-widening': 'warn',
            'codicus/no-reflect-apply': 'warn',
            'codicus/no-reflect-get': 'warn',
            'codicus/no-widen-then-assert': 'error',
            'codicus/require-safety-comment-for-type-assertion': 'warn',
        },
    },
    {
        name: '@codicus/javascript/rules',
        files: javascriptFiles,
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            curly: ['error', 'all'],
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            'no-console': 'warn',
            'no-var': 'error',
            'prefer-const': 'error',
            'prefer-object-has-own': 'error',
        },
    },
    {
        name: '@codicus/scripts',
        files: ['**/scripts/**/*.{js,cjs,mjs,ts,cts,mts}'],
        rules: {
            'no-console': 'off',
        },
    },
    {
        name: '@codicus/vitest-globals',
        files: ['**/*.{test,spec}.{js,cjs,mjs,ts,cts,mts,jsx,tsx}'],
        languageOptions: {
            globals: globals.vitest,
        },
    },
]);

export default config;
