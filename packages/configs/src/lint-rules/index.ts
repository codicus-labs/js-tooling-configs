import type { Plugin } from '@oxlint/plugins';

import { noChainedTypeAssertions } from './no-chained-type-assertions.ts';
import { noKnownValueWidening } from './no-known-value-widening.ts';
import { noModuleMocking } from './no-module-mocking.ts';
import { noReflectApply, noReflectGet } from './no-reflect-method.ts';
import { noWidenThenAssert } from './no-widen-then-assert.ts';
import { packageBoundaries } from './package-boundaries.ts';
import { requireSafetyCommentForTypeAssertion } from './require-safety-comment-for-type-assertion.ts';

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
