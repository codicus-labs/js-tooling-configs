import { defineConfig } from 'oxlint';

import preset from './src/oxlint.ts';

export default defineConfig({
    ...preset,
    jsPlugins: [{ name: 'codicus', specifier: './src/lint-rules/index.ts' }],
    overrides: [
        ...preset.overrides,
        {
            files: ['src/eslint-svelte.ts'],
            rules: {
                'codicus/no-chained-type-assertions': 'off',
                'typescript/no-unsafe-type-assertion': 'off',
            },
        },
    ],
});
