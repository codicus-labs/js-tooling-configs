import { defineConfig } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';

export default defineConfig({
    ...playwright.configs['flat/recommended'],
    name: '@codicus/playwright',
    files: ['**/e2e/**/*.{test,spec}.{js,cjs,mjs,ts,cts,mts,jsx,tsx}'],
});
