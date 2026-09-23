import baseConfig from './index.js';
import type { OxlintConfig } from './types.js';

const packageBoundariesConfig = {
    ...baseConfig,
    rules: {
        ...baseConfig.rules,
        'codicus/package-boundaries': 'error',
    },
} satisfies OxlintConfig;

export default packageBoundariesConfig;
