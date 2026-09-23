import type { ESTree, Rule } from '@oxlint/plugins';

import { isConstAssertion, isTypeAssertion, unwrapExpression, type TypeAssertion } from './shared.js';

function isOutermost(node: TypeAssertion): boolean {
    let current: ESTree.Expression = node;
    let parent = node.parent;

    while (parent.type === 'ParenthesizedExpression' && parent.expression === current) {
        current = parent;
        parent = parent.parent;
    }

    return !isTypeAssertion(parent) || parent.expression !== current;
}

function isForbiddenChain(node: TypeAssertion): boolean {
    let current: ESTree.Expression = node;
    let count = 0;
    let hasNonConstAssertion = false;

    while (isTypeAssertion(current)) {
        count += 1;
        hasNonConstAssertion ||= !isConstAssertion(current);
        current = unwrapExpression(current.expression);
    }

    return count > 1 && hasNonConstAssertion;
}

export const noChainedTypeAssertions: Rule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow chained TypeScript assertions that recreate discarded type evidence.',
        },
        messages: {
            chained:
                'This assertion chain discards type evidence. Preserve the precise type or validate the value before narrowing it.',
        },
    },
    create(context) {
        const check = (node: TypeAssertion) => {
            if (isOutermost(node) && isForbiddenChain(node)) {
                context.report({ node, messageId: 'chained' });
            }
        };

        return {
            TSAsExpression: check,
            TSTypeAssertion: check,
        };
    },
};
