import { defineConfig } from 'eslint/config';

import { lintRulesPlugin, sourceFiles } from './lint-rules-plugin.js';

const config = defineConfig([
    {
        name: '@codicus/package-boundaries',
        files: sourceFiles,
        plugins: {
            codicus: lintRulesPlugin(),
        },
        rules: {
            'codicus/package-boundaries': 'error',
        },
    },
]);

export default config;
