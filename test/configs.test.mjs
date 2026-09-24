import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';
import svelteConfig from '@codicus/configs/eslint/svelte';
import oxlintConfig from '@codicus/configs/oxlint';
import vitestConfig from '@codicus/configs/vitest/svelte';

const root = fileURLToPath(new URL('../', import.meta.url));

test('ESLint parses Svelte components', async () => {
    const eslint = new ESLint({ overrideConfig: svelteConfig(root), overrideConfigFile: true });
    const [result] = await eslint.lintText('<script>let count = 1;</script>\n<h1>{count}</h1>', {
        filePath: `${root}/example.svelte`,
    });
    assert.equal(result.errorCount, 0);
});

test('Oxlint auto-discovers the root config and resolves custom rules', () => {
    assert.deepEqual(oxlintConfig.jsPlugins, [{ name: 'codicus', specifier: '@codicus/configs/lint-rules' }]);
    const result = spawnSync('pnpm', ['exec', 'oxlint', 'src/commitlint.ts'], {
        cwd: root,
        encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('Oxfmt auto-discovers the root config and formats Svelte', () => {
    const result = spawnSync('pnpm', ['exec', 'oxfmt', '--stdin-filepath=example.svelte'], {
        cwd: root,
        encoding: 'utf8',
        input: '<script>let count=1;</script>\n<h1 class="px-4 flex bg-red-500">{count}</h1>\n<style>h1{color:red;}</style>\n',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /<script>\n    let count = 1;\n<\/script>/);
    assert.match(result.stdout, /class="flex bg-red-500 px-4"/);
    assert.match(result.stdout, /<style>\n    h1 \{\n        color: red;\n    \}\n<\/style>/);
});

test('pnpm plugin applies the installation policy', async () => {
    const { hooks } = await import('@codicus/configs/pnpm-plugin');
    const config = hooks.updateConfig({ minimumReleaseAgeExclude: ['example'] });
    assert.equal(config.blockExoticSubdeps, true);
    assert.deepEqual(config.minimumReleaseAgeExclude, ['example', '@codicus/*']);
});

test('Vitest Svelte preset includes the Svelte plugin', () => {
    assert.ok(vitestConfig.plugins?.length);
    assert.equal(vitestConfig.test.environment, 'jsdom');
});
