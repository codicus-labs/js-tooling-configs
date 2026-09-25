import { defineConfig } from 'oxlint';

import preset from './packages/configs/src/oxlint.ts';

export default defineConfig({
    ...preset,
    jsPlugins: [{ name: 'codicus', specifier: './packages/configs/src/lint-rules/index.ts' }],
    overrides: [
        ...preset.overrides,
        {
            files: ['oxlint.config.ts', 'oxfmt.config.ts'],
            rules: { 'codicus/package-boundaries': 'off' },
        },
        {
            files: ['packages/configs/src/eslint-svelte.ts'],
            rules: {
                'codicus/no-chained-type-assertions': 'off',
                'typescript/no-unsafe-type-assertion': 'off',
            },
        },
    ],
});
