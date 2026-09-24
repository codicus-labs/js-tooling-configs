import { defineConfig } from 'oxlint';

const baseConfig = defineConfig({
    categories: {
        correctness: 'error',
        perf: 'warn',
        suspicious: 'warn',
    },
    options: {
        denyWarnings: true,
        reportUnusedDisableDirectives: 'error',
        respectEslintDisableDirectives: false,
        typeAware: true,
    },
    ignorePatterns: ['**/coverage/**', '**/dist/**', '**/node_modules/**', '**/*.generated.*'],
    jsPlugins: [{ name: 'codicus', specifier: '@codicus/configs/lint-rules' }],
    plugins: ['eslint', 'import', 'promise', 'typescript', 'unicorn', 'vitest'],
    overrides: [
        {
            files: ['**/*.{test,spec}.{js,ts}'],
            env: {
                vitest: true,
            },
        },
        {
            files: ['**/*.js'],
            rules: {
                curly: ['error', 'all'],
            },
        },
        {
            files: ['**/*.{ts,mts,cts,tsx}'],
            rules: {
                'no-restricted-imports': [
                    'error',
                    {
                        patterns: [
                            {
                                regex: '^\\.{1,2}/.*\\.js$',
                                message: 'Import TypeScript source using its .ts extension.',
                            },
                        ],
                    },
                ],
            },
        },
    ],
    rules: {
        eqeqeq: ['error', 'always', { null: 'ignore' }],
        'import/extensions': ['error', 'ignorePackages', { checkTypeImports: true }],
        'codicus/no-chained-type-assertions': 'error',
        'codicus/no-known-value-widening': 'warn',
        'codicus/no-module-mocking': 'error',
        'codicus/no-reflect-apply': 'warn',
        'codicus/no-reflect-get': 'warn',
        'codicus/no-widen-then-assert': 'error',
        'codicus/package-boundaries': 'error',
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
        'typescript/no-floating-promises': 'error',
        'typescript/no-misused-promises': 'error',
        'typescript/restrict-template-expressions': 'error',
        'typescript/switch-exhaustiveness-check': 'error',
    },
});

export default baseConfig;
