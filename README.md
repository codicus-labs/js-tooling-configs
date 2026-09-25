# js-tooling-configs

- [`@codicus/configs`](packages/configs/README.md): Oxlint, Oxfmt, ESLint/Svelte, and TypeScript presets.
- [`@codicus/pnpm-plugin-configs`](packages/pnpm-plugin/README.md): pnpm installation policy.

Use Node from `.node-version` and pnpm 12.4.2. Run `pnpm install --frozen-lockfile`, `pnpm build`, and `pnpm check` (typecheck, lint, format, and Knip). Optional hooks: `pnpm hooks:install`.
