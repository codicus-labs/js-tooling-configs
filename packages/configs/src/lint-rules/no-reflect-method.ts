import type { ESTree, Rule, SourceCode } from '@oxlint/plugins';

function isReflectMethod(sourceCode: SourceCode, callee: ESTree.Expression, method: 'apply' | 'get'): boolean {
    if (callee.type !== 'MemberExpression' || callee.object.type !== 'Identifier') return false;
    if (callee.object.name !== 'Reflect' || !sourceCode.isGlobalReference(callee.object)) return false;

    return callee.computed
        ? callee.property.type === 'Literal' && callee.property.value === method
        : callee.property.type === 'Identifier' && callee.property.name === method;
}

function createRule(method: 'apply' | 'get'): Rule {
    return {
        meta: {
            type: 'suggestion',
            docs: {
                description: `Prefer typed operations over Reflect.${method}.`,
            },
            messages: {
                avoid: `Reflect.${method} bypasses useful static type evidence. Prefer a typed operation or validate the dynamic boundary.`,
            },
        },
        create(context) {
            return {
                CallExpression(node) {
                    if (
                        node.callee.type !== 'Super' &&
                        node.callee.type !== 'V8IntrinsicExpression' &&
                        isReflectMethod(context.sourceCode, node.callee, method)
                    ) {
                        context.report({ node, messageId: 'avoid' });
                    }
                },
            };
        },
    };
}

export const noReflectApply = createRule('apply');
export const noReflectGet = createRule('get');
