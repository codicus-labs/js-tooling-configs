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

test('Oxlint resolves the bundled custom rules', () => {
    assert.deepEqual(oxlintConfig.jsPlugins, [{ name: 'codicus', specifier: '@codicus/configs/lint-rules' }]);
    const result = spawnSync('pnpm', ['exec', 'oxlint', '-c', 'dist/oxlint/index.js', 'src/commitlint.ts'], {
        cwd: root,
        encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('Oxfmt formats Svelte without a separate Prettier install', () => {
    const result = spawnSync('pnpm', ['exec', 'oxfmt', '--config=oxfmt.json', '--stdin-filepath=example.svelte'], {
        cwd: root,
        encoding: 'utf8',
        input: '<script>let count=1;</script>\n<h1>{count}</h1>\n',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /let count = 1;/);
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
