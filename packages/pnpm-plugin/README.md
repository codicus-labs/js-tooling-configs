# @codicus/pnpm-plugin-configs

Shared installation policy for pnpm 12. Install it as a config dependency, not a regular dependency:

```sh
pnpm add --config @codicus/pnpm-plugin-configs
```

pnpm loads this package's `pnpmfile.mjs` before installing regular dependencies. The hook requires Node 24+, enforces strict engine, build, release-age, and supply-chain checks, and excludes `@codicus/*` from the one-day minimum release age.
