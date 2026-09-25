import { defineConfig } from 'oxfmt';

export default defineConfig({
    arrowParens: 'always',
    endOfLine: 'lf',
    ignorePatterns: ['.changeset/', '**/.memory/', '**/.svelte-kit/', '**/CHANGELOG.md', '**/dist/'],
    printWidth: 120,
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'all',
    useTabs: false,
    sortPackageJson: true,
    sortImports: true,
});
