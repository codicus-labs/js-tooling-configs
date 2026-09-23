import { defineConfig } from 'eslint/config';

import { lintRulesPlugin, sourceFiles } from './lint-rules-plugin.js';

const config = defineConfig([
    {
        name: '@codicus/no-module-mocking',
        files: sourceFiles,
        plugins: {
            codicus: lintRulesPlugin(),
        },
        rules: {
            'codicus/no-module-mocking': 'error',
        },
    },
]);

export default config;
