# @codicus/configs

## 0.5.0

### Minor Changes

- Enable `import/no-cycle` as an error in the default Oxlint preset.

## 0.4.0

### Minor Changes

- Remove the pnpm-plugin subpath. Install @codicus/pnpm-plugin-configs as a separate pnpm config dependency instead.

## 0.3.0

### Minor Changes

- Simplify the published presets to Oxlint, Oxfmt, ESLint/Svelte, and shared TypeScript configs. Remove the legacy ESLint, Vitest, commitlint, specialized Oxlint, and Svelte tsconfig exports; consumers must update their imports. Build the presets with tsdown and enable type-aware Oxlint rules by default.

## 0.2.0

### Minor Changes

- Sort Tailwind classes in formatted files, including Svelte components.

### Patch Changes

- Indent Svelte script and style blocks when formatting.
