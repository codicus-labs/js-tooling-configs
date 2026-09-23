import type { Linter } from 'eslint';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

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

export default function createTypeCheckedConfig(tsconfigRootDir: string) {
    return defineConfig({
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
    });
}
