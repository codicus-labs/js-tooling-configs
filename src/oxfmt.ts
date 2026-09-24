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
    svelte: { indentScriptAndStyle: true },
    sortTailwindcss: {
        functions: ['cn', 'tv'],
    },
    sortPackageJson: true,
    sortImports: true,
});
