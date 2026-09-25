import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: {
        'eslint-svelte': 'src/eslint-svelte.ts',
        oxlint: 'src/oxlint.ts',
        oxfmt: 'src/oxfmt.ts',
        'lint-rules/index': 'src/lint-rules/index.ts',
    },
    format: 'esm',
    dts: true,
    tsconfig: 'tsconfig.json',
});
