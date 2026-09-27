# @codicus/configs

Shared Oxlint, Oxfmt and TypeScript configs for Node 24+ projects. For a new TypeScript library, start from the [TypeScript library template](https://github.com/codicus-labs/typescript-library-template); configure tests, CI and Git hooks in the project.

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

The shared Oxfmt preset leaves Svelte formatting and Tailwind class sorting disabled; enable either in your project's `oxfmt.config.ts` when needed.

In the library template, have `configs/tsconfig.base.json` extend `@codicus/configs/tsconfig/base.json`; keep source paths, cache locations and project references local. For a standalone Node project, extend `@codicus/configs/tsconfig/node.json`. Set `env: { node: true }` in the project Oxlint config if you need Node globals. Run `pnpm exec oxlint .` and `pnpm exec oxfmt --check .`.

For SvelteKit, use the separate [`@codicus/eslint-svelte`](../eslint-svelte/README.md) package. For repository development, see the [monorepo README](../../README.md).
