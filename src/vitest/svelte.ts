import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig, mergeConfig } from 'vitest/config';

import node from './node.js';

const config = mergeConfig(
    node,
    defineConfig({
        plugins: [svelte()],
        test: {
            environment: 'jsdom',
            coverage: {
                include: ['src/**/*.svelte'],
            },
        },
    }),
);

export default config;
