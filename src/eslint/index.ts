import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';

import base from './base.js';
import playwright from './playwright.js';
import createTypeCheckedConfig from './typescript-type-checked.js';
import vitest from './vitest.js';

export default function createConfig(tsconfigRootDir: string) {
    return defineConfig(
        ...base,
        ...createTypeCheckedConfig(tsconfigRootDir),
        ...vitest,
        ...playwright,
        {
            name: '@codicus/node/tooling',
            files: ['**/*.{config,conf}.{js,cjs,mjs,ts,cts,mts}', '**/scripts/**/*.{js,cjs,mjs,ts,cts,mts}'],
            languageOptions: {
                globals: globals.node,
            },
        },
        prettier,
    );
}
