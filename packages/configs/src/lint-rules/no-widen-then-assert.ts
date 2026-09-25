import type { ESTree, Rule } from '@oxlint/plugins';

import { classifyBroadTarget, hasKnownValue, type BroadTarget } from './no-known-value-widening.ts';
import {
    isStableConst,
    nodeEnd,
    nodeStart,
    resolveVariable,
    unwrapExpression,
    variableDeclarator,
    type TypeAssertion,
} from './shared.ts';

function initializerBroadTarget(
    declarator: ESTree.VariableDeclarator,
): { expression: ESTree.Expression; target: BroadTarget } | null {
    if (declarator.id.type !== 'Identifier' || declarator.init === null) return null;

    const annotation = declarator.id.typeAnnotation?.typeAnnotation;
    if (annotation !== null && annotation !== undefined) {
        const target = classifyBroadTarget(annotation);
        if (target !== null) return { expression: declarator.init, target };
    }

    const initializer = unwrapExpression(declarator.init);
    if (initializer.type !== 'TSAsExpression' && initializer.type !== 'TSTypeAssertion') return null;
    const target = classifyBroadTarget(initializer.typeAnnotation);
    return target === null ? null : { expression: initializer.expression, target };
}

function isNarrower(type: ESTree.TSType): boolean {
    return classifyBroadTarget(type) === null;
}

export const noWidenThenAssert: Rule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow immutable local values that are widened and later asserted narrower.',
        },
        messages: {
            widenThenAssert:
                'Binding `{{name}}` discards type evidence and later recreates it with an assertion. Preserve the precise type through the full flow.',
        },
    },
    create(context) {
        const check = (node: TypeAssertion) => {
            const expression = unwrapExpression(node.expression);
            if (expression.type !== 'Identifier' || !isNarrower(node.typeAnnotation)) return;

            const variable = resolveVariable(context.sourceCode, expression);
            if (variable === null) return;
            const declarator = variableDeclarator(variable);
            if (
                declarator === null ||
                declarator.init === null ||
                nodeStart(node) <= nodeEnd(declarator) ||
                !isStableConst(variable, declarator)
            ) {
                return;
            }

            const widened = initializerBroadTarget(declarator);
            if (widened === null || !hasKnownValue(context.sourceCode, widened.expression)) return;

            context.report({
                node,
                messageId: 'widenThenAssert',
                data: { name: expression.name },
            });
        };

        return {
            TSAsExpression: check,
            TSTypeAssertion: check,
        };
    },
};
