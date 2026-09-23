import { defineConfig } from 'eslint/config';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

import createConfig from './index.js';

export default function createSvelteConfig(tsconfigRootDir: string) {
    return defineConfig(...createConfig(tsconfigRootDir), ...svelte.configs.recommended, {
        name: '@codicus/svelte',
        files: ['**/*.{ts,tsx,svelte}'],
        languageOptions: {
            globals: globals.browser,
        },
    });
}
