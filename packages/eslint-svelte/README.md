# @codicus/eslint-svelte

Shared ESLint preset for SvelteKit projects using TypeScript 6. Install it alongside your SvelteKit dependencies:

```sh
pnpm add -D @codicus/configs @codicus/eslint-svelte typescript@^6 eslint typescript-eslint svelte-check oxfmt
```

```js
// eslint.config.js
import createConfig from '@codicus/eslint-svelte';
export default createConfig(import.meta.dirname);
```

The ESLint preset depends on `@codicus/configs` for shared lint rules. Install `@codicus/configs` directly if you use its Oxfmt and TypeScript presets:

```ts
// oxfmt.config.ts
import base from '@codicus/configs/oxfmt';
import { defineConfig } from 'oxfmt';

export default defineConfig({
    ...base,
    svelte: { indentScriptAndStyle: true },
});
```

For Tailwind projects, also add `sortTailwindcss: { functions: ['cn', 'tv'] }` to this config. Svelte formatting requires the project's `svelte` dependency.

After `svelte-kit sync`, extend the shared base before SvelteKit's generated config so its framework defaults take precedence:

```json
{ "extends": ["@codicus/configs/tsconfig/base.json", "./.svelte-kit/tsconfig.json"] }
```

Run `pnpm exec eslint src` and `pnpm exec svelte-check --tsconfig tsconfig.json`. Format with `pnpm exec oxfmt --check .`.

For repository development, see the [monorepo README](../../README.md).
