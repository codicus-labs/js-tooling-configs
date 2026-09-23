import baseConfig from './index.js';
import type { OxlintConfig } from './types.js';

const nodeConfig = {
    ...baseConfig,
    env: {
        node: true,
    },
    plugins: [...baseConfig.plugins, 'node'],
} satisfies OxlintConfig;

export default nodeConfig;
