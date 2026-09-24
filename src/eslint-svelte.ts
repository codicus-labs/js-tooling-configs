import js from '@eslint/js';
import type { ESLint, Linter } from 'eslint';
import prettier from 'eslint-config-prettier/flat';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import lintRules from './lint-rules/index.ts';

const sourceFiles = ['**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx,svelte}'];
const javascriptFiles = ['**/*.{js,cjs,mjs}'];
const typescriptFiles = ['**/*.{ts,cts,mts,tsx}'];

const strictTypeScriptRules: Linter.RulesRecord = {
    '@typescript-eslint/ban-ts-comment': [
        'error',
        {
            minimumDescriptionLength: 10,
            'ts-expect-error': 'allow-with-description',
            'ts-ignore': true,
        },
    ],
    '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports', prefer: 'type-imports' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
};

export default function createConfig(tsconfigRootDir: string) {
    return defineConfig(
        {
            name: '@codicus/ignores',
            ignores: ['**/.svelte-kit/**', '**/coverage/**', '**/dist/**', '**/node_modules/**', '**/*.generated.*'],
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
                // SAFETY: Shared rules use the ESLint plugin runtime shape despite differing TypeScript declarations.
                codicus: lintRules as unknown as ESLint.Plugin,
            },
            rules: {
                'codicus/no-chained-type-assertions': 'error',
                'codicus/no-known-value-widening': 'warn',
                'codicus/no-module-mocking': 'error',
                'codicus/no-reflect-apply': 'warn',
                'codicus/no-reflect-get': 'warn',
                'codicus/no-widen-then-assert': 'error',
                'codicus/package-boundaries': 'error',
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
            name: '@codicus/typescript/type-checked',
            files: typescriptFiles,
            extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
            languageOptions: {
                parserOptions: {
                    projectService: true,
                    tsconfigRootDir,
                },
            },
            rules: strictTypeScriptRules,
        },
        prettier,
        ...svelte.configs.recommended,
        {
            name: '@codicus/svelte',
            files: ['**/*.{ts,tsx,svelte}'],
            languageOptions: {
                globals: globals.browser,
            },
        },
    );
}
