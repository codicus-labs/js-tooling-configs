import type { ESTree, Rule, SourceCode } from '@oxlint/plugins';

import { resolveVariable } from './shared.ts';

const methods = new Set(['doMock', 'mock', 'unstable_mockModule']);

function importedName(node: ESTree.Node): string | null {
    if (node.type !== 'ImportSpecifier') return null;
    return node.imported.type === 'Identifier' ? node.imported.name : node.imported.value;
}

function isFrameworkObject(sourceCode: SourceCode, expression: ESTree.Expression): boolean {
    if (expression.type !== 'Identifier' || (expression.name !== 'vi' && expression.name !== 'jest')) {
        return false;
    }
    if (sourceCode.isGlobalReference(expression)) return true;

    const variable = resolveVariable(sourceCode, expression);
    if (variable === null || variable.defs.length === 0) return true;
    return variable.defs.some((definition) => {
        if (definition.type !== 'ImportBinding' || definition.parent?.type !== 'ImportDeclaration') {
            return false;
        }
        const source = definition.parent.source.value;
        const name = importedName(definition.node);
        return (source === 'vitest' && name === 'vi') || (source === '@jest/globals' && name === 'jest');
    });
}

function isModuleMock(sourceCode: SourceCode, callee: ESTree.Expression): boolean {
    if (callee.type !== 'MemberExpression' || !isFrameworkObject(sourceCode, callee.object)) {
        return false;
    }

    const method = callee.computed
        ? callee.property.type === 'Literal' && typeof callee.property.value === 'string'
            ? callee.property.value
            : null
        : callee.property.type === 'Identifier'
          ? callee.property.name
          : null;
    return method !== null && methods.has(method);
}

export const noModuleMocking: Rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Prefer explicit dependency seams over Jest or Vitest module mocking.',
        },
        messages: {
            moduleMock: 'Replace module mocking with dependency injection through an interface or test implementation.',
        },
    },
    create(context) {
        return {
            CallExpression(node) {
                if (
                    node.callee.type !== 'Super' &&
                    node.callee.type !== 'V8IntrinsicExpression' &&
                    isModuleMock(context.sourceCode, node.callee)
                ) {
                    context.report({ node, messageId: 'moduleMock' });
                }
            },
        };
    },
};
