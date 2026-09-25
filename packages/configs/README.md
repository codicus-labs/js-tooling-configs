# @codicus/configs

Shared Oxlint, Oxfmt, ESLint/Svelte and TypeScript configs for Node 24+ projects. For a new TypeScript library, start from the [TypeScript library template](https://github.com/codicus-labs/typescript-library-template); configure tests, CI and Git hooks in the project.

## TypeScript 7: Oxlint

```sh
pnpm add -D @codicus/configs typescript@^7 oxlint oxlint-tsgolint oxfmt @types/node
```

```ts
// oxlint.config.ts
export { default } from '@codicus/configs/oxlint';
```

```ts
// oxfmt.config.ts
export { default } from '@codicus/configs/oxfmt';
```

In the library template, have `configs/tsconfig.base.json` extend `@codicus/configs/tsconfig/base.json`; keep source paths, cache locations and project references local. For a standalone Node project, extend `@codicus/configs/tsconfig/node.json`. Set `env: { node: true }` in the project Oxlint config if you need Node globals. Run `pnpm exec oxlint .` and `pnpm exec oxfmt --check .`.

## SvelteKit: TypeScript 6 and ESLint

SvelteKit uses the ESLint preset instead of Oxlint. Install these alongside your SvelteKit dependencies:

```sh
pnpm add -D @codicus/configs typescript@^6 eslint typescript-eslint svelte-check oxfmt
```

```js
// eslint.config.js
import createConfig from '@codicus/configs/eslint-svelte';
export default createConfig(import.meta.dirname);
```

```ts
// oxfmt.config.ts
export { default } from '@codicus/configs/oxfmt';
```

After `svelte-kit sync`, extend the shared base before SvelteKit's generated config so its framework defaults take precedence:

```json
{ "extends": ["@codicus/configs/tsconfig/base.json", "./.svelte-kit/tsconfig.json"] }
```

Run `pnpm exec eslint src` and `pnpm exec svelte-check --tsconfig tsconfig.json`. Format with `pnpm exec oxfmt --check .`.

For repository development, see the [monorepo README](../../README.md).
