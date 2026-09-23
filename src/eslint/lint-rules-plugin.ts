import type { ESLint } from 'eslint';

import lintRules from '../lint-rules/index.js';

export const sourceFiles = ['**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx,svelte}'];

export function lintRulesPlugin(): ESLint.Plugin {
    const plugin: unknown = lintRules;
    // SAFETY: Integration tests verify the shared Oxlint plugin's ESLint runtime contract.
    return plugin as ESLint.Plugin;
}
