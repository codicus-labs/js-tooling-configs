import type { Plugin } from '@oxlint/plugins';

import { noChainedTypeAssertions } from './no-chained-type-assertions.js';
import { packageBoundaries } from './package-boundaries.js';
import { noKnownValueWidening } from './no-known-value-widening.js';
import { noModuleMocking } from './no-module-mocking.js';
import { noReflectApply, noReflectGet } from './no-reflect-method.js';
import { noWidenThenAssert } from './no-widen-then-assert.js';
import { requireSafetyCommentForTypeAssertion } from './require-safety-comment-for-type-assertion.js';

const plugin: Plugin = {
    meta: {
        name: '@codicus/configs/lint-rules',
    },
    rules: {
        'no-chained-type-assertions': noChainedTypeAssertions,
        'no-known-value-widening': noKnownValueWidening,
        'no-module-mocking': noModuleMocking,
        'package-boundaries': packageBoundaries,
        'no-reflect-apply': noReflectApply,
        'no-reflect-get': noReflectGet,
        'no-widen-then-assert': noWidenThenAssert,
        'require-safety-comment-for-type-assertion': requireSafetyCommentForTypeAssertion,
    },
};

export default plugin;
