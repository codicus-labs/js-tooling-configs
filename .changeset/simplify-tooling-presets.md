---
"@codicus/configs": minor
---

Simplify the published presets to Oxlint, Oxfmt, ESLint/Svelte, and shared TypeScript configs. Remove the legacy ESLint, Vitest, commitlint, specialized Oxlint, and Svelte tsconfig exports; consumers must update their imports. Build the presets with tsdown and enable type-aware Oxlint rules by default.
