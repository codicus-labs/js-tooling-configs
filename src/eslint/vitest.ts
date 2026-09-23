import vitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';

const recommended = vitest.configs.recommended;

export default defineConfig({
    ...recommended,
    name: '@codicus/vitest',
    files: ['**/*.{test,spec}.{js,cjs,mjs,ts,cts,mts,jsx,tsx}'],
    languageOptions: {
        globals: vitest.environments.env.globals,
    },
});
