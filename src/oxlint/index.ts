import type { OxlintConfig } from './types.js';

const baseConfig = {
    categories: {
        correctness: 'error',
        perf: 'warn',
        suspicious: 'warn',
    },
    options: {
        denyWarnings: true,
        reportUnusedDisableDirectives: 'error',
        respectEslintDisableDirectives: false,
    },
    ignorePatterns: ['**/coverage/**', '**/dist/**', '**/node_modules/**', '**/*.generated.*'],
    jsPlugins: [{ name: 'codicus', specifier: '@codicus/configs/lint-rules' }],
    plugins: ['eslint', 'import', 'promise', 'typescript', 'unicorn', 'vitest'],
    overrides: [
        {
            files: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
            env: {
                vitest: true,
            },
        },
        {
            files: ['**/*.{js,cjs,mjs}'],
            rules: {
                curly: ['error', 'all'],
            },
        },
        {
            files: ['**/scripts/**/*.{js,cjs,mjs,ts,cts,mts}'],
            rules: {
                'no-console': 'off',
            },
        },
    ],
    rules: {
        eqeqeq: ['error', 'always', { null: 'ignore' }],
        'codicus/no-chained-type-assertions': 'error',
        'codicus/no-known-value-widening': 'warn',
        'codicus/no-reflect-apply': 'warn',
        'codicus/no-reflect-get': 'warn',
        'codicus/no-widen-then-assert': 'error',
        'codicus/require-safety-comment-for-type-assertion': 'warn',
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-var': 'error',
        'no-warning-comments': [
            'error',
            { location: 'start', terms: ['eslint-disable', 'eslint-enable', 'oxlint-disable', 'oxlint-enable'] },
        ],
        'prefer-const': 'error',
        'prefer-object-has-own': 'error',
        'typescript/ban-ts-comment': [
            'error',
            {
                minimumDescriptionLength: 10,
                'ts-expect-error': 'allow-with-description',
                'ts-ignore': true,
            },
        ],
    },
} satisfies OxlintConfig;

export default baseConfig;
