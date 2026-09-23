import { coverageConfigDefaults, defineConfig } from 'vitest/config';

const config = defineConfig({
    test: {
        clearMocks: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov', 'cobertura'],
            reportsDirectory: 'coverage',
            include: ['src/**/*.{js,cjs,mjs,ts,cts,mts,jsx,tsx}'],
            exclude: [
                ...coverageConfigDefaults.exclude,
                'src/**/*.{test,spec}.{js,cjs,mjs,ts,cts,mts,jsx,tsx}',
                'src/**/*.stories.{js,ts,jsx,tsx}',
                'src/**/index.{js,ts}',
            ],
            thresholds: {
                branches: 80,
                functions: 80,
                lines: 80,
                statements: 80,
            },
        },
        environment: 'node',
        globals: true,
        passWithNoTests: false,
        restoreMocks: true,
    },
});

export default config;
