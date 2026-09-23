import baseConfig from './index.js';
import type { OxlintConfig } from './types.js';

const noModuleMockingConfig = {
    ...baseConfig,
    rules: {
        ...baseConfig.rules,
        'codicus/no-module-mocking': 'error',
    },
} satisfies OxlintConfig;

export default noModuleMockingConfig;
