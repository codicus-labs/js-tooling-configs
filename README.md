# @codicus/configs

Shared JavaScript, TypeScript, Node, and Svelte/SvelteKit tooling presets in one npm package. Node.js 24+ and pnpm are expected. The initial npm release has not been published yet.

## Presets

| Tool         | Exports                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------- |
| ESLint       | `eslint`, `eslint/node`, `eslint/svelte`, `eslint/package-boundaries`, `eslint/no-module-mocking` |
| Oxlint       | `oxlint`, `oxlint/node`, `oxlint/package-boundaries`, `oxlint/no-module-mocking`                  |
| Oxfmt        | `oxfmt`                                                                                           |
| TypeScript   | `tsconfig/base.json`, `tsconfig/node.json`, `tsconfig/svelte.json`                                |
| Vitest       | `vitest`, `vitest/svelte`                                                                         |
| Commitlint   | `commitlint`                                                                                      |
| Custom rules | `lint-rules` (already included by the ESLint and Oxlint presets)                                  |
| pnpm hook    | `pnpm-plugin`                                                                                     |

All paths above are prefixed with `@codicus/configs/`. Install the peer tools used by your chosen presets; Svelte projects also need `svelte` and, for the Vitest preset, `@sveltejs/vite-plugin-svelte` and `jsdom`.

```js
// eslint.config.js — SvelteKit
import createSvelteConfig from '@codicus/configs/eslint/svelte';
export default createSvelteConfig(import.meta.dirname);
```

```js
// oxlint.config.js — lints JS/TS; ESLint handles .svelte files
export { default } from '@codicus/configs/oxlint';
```

Oxfmt formats `.svelte` with bundled Prettier when `svelte` is installed. Use the JSON preset directly: `oxfmt --config node_modules/@codicus/configs/oxfmt.json .`. A separate Prettier package is not required.

```json
// tsconfig.json — SvelteKit; run `svelte-kit sync` to generate .svelte-kit/tsconfig.json
{
    "extends": ["@codicus/configs/tsconfig/svelte.json", "./.svelte-kit/tsconfig.json"]
}
```

```js
// vitest.config.js
export { default } from '@codicus/configs/vitest/svelte';
```

```js
// commitlint.config.js
export { default } from '@codicus/configs/commitlint';
```

For the pnpm policy, install `@codicus/configs` first, then add a workspace-root `.pnpmfile.mjs`:

```js
export { hooks } from '@codicus/configs/pnpm-plugin';
```

Unlike a dedicated `pnpm-plugin-*` config dependency, this **single package** cannot bootstrap its own pnpm hook before dependencies are installed: pnpm config dependencies cannot have regular dependencies. Keep the package installed for subsequent installs, or split the hook into a separate package if first-install enforcement becomes necessary.

## Development

```sh
pnpm install
pnpm check
```

## Releases

The first publish must be done manually (`pnpm check && npm publish --access public`); npm trusted publishing can only be configured on an existing package. Then, on npmjs.com under `@codicus/configs` → Settings → Trusted Publisher, configure GitHub Actions for owner `codicus-labs`, repository `js-tooling-configs`, workflow `publish.yml`, with direct `npm publish` allowed. The workflow needs no npm token.

For subsequent changes, commit an intent with `pnpm change` (preview with `pnpm change status`). These `.changeset/` files are pnpm's native format; neither the Changesets CLI nor its action is used. On `main`, the Release PR workflow runs `pnpm version -r`, writes `CHANGELOG.md`, and opens/updates `release-pr/main`. Merge that PR to publish the new version to npm and create a GitHub release. The repository or organization must allow GitHub Actions to create pull requests under Settings → Actions → General → Workflow permissions. PRs created with `GITHUB_TOKEN` do not trigger CI automatically, but the publish workflow reruns checks before publishing.

The package has no license grant (`UNLICENSED`); decide on a public license before inviting external reuse.
