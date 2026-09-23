import { defineConfig } from 'eslint/config';
import globals from 'globals';

import createConfig from './index.js';

export default function createNodeConfig(tsconfigRootDir: string) {
    return defineConfig(...createConfig(tsconfigRootDir), {
        name: '@codicus/node',
        files: ['**/*.{js,cjs,mjs,ts,cts,mts}'],
        languageOptions: {
            globals: globals.node,
        },
    });
}
