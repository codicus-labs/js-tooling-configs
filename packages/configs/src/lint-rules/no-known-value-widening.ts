import type { ESTree, Rule, SourceCode, Variable } from '@oxlint/plugins';

import { isStableConst, resolveVariable, unwrapExpression, unwrapType, variableDeclarator } from './shared.ts';

export type BroadTarget = 'object' | 'open dictionary' | 'unknown';

function referenceName(type: ESTree.TSTypeReference): string | null {
    return type.typeName.type === 'Identifier' ? type.typeName.name : null;
}

function isBroadKey(type: ESTree.TSType): boolean {
    const current = unwrapType(type);
    return (
        current.type === 'TSStringKeyword' ||
        current.type === 'TSNumberKeyword' ||
        current.type === 'TSSymbolKeyword' ||
        (current.type === 'TSTypeReference' && referenceName(current) === 'PropertyKey') ||
        (current.type === 'TSUnionType' && current.types.every(isBroadKey))
    );
}

export function classifyBroadTarget(type: ESTree.TSType): BroadTarget | null {
    const current = unwrapType(type);
    if (current.type === 'TSAnyKeyword' || current.type === 'TSUnknownKeyword') return 'unknown';
    if (current.type === 'TSObjectKeyword') return 'object';

    if (current.type === 'TSTypeReference') {
        if (referenceName(current) === 'Readonly') {
            const [wrapped] = current.typeArguments?.params ?? [];
            return wrapped === undefined ? null : classifyBroadTarget(wrapped);
        }

        if (referenceName(current) === 'Record') {
            const [key] = current.typeArguments?.params ?? [];
            return key !== undefined && isBroadKey(key) ? 'open dictionary' : null;
        }
    }

    if (current.type === 'TSTypeLiteral' && current.members.some((member) => member.type === 'TSIndexSignature')) {
        return 'open dictionary';
    }

    return null;
}

export function hasKnownValue(
    sourceCode: SourceCode,
    expression: ESTree.Expression,
    visited = new Set<Variable>(),
): boolean {
    const current = unwrapExpression(expression);
    if (
        current.type === 'ArrayExpression' ||
        current.type === 'ArrowFunctionExpression' ||
        current.type === 'ClassExpression' ||
        current.type === 'FunctionExpression' ||
        current.type === 'Literal' ||
        current.type === 'NewExpression' ||
        current.type === 'ObjectExpression' ||
        current.type === 'TemplateLiteral'
    ) {
        return true;
    }

    if (current.type !== 'Identifier') return false;
    const variable = resolveVariable(sourceCode, current);
    if (variable === null || visited.has(variable)) return false;
    const declarator = variableDeclarator(variable);
    if (declarator === null || declarator.init === null || !isStableConst(variable, declarator)) {
        return false;
    }

    visited.add(variable);
    return hasKnownValue(sourceCode, declarator.init, visited);
}

function isEmptyObject(expression: ESTree.Expression): boolean {
    const current = unwrapExpression(expression);
    return current.type === 'ObjectExpression' && current.properties.length === 0;
}

export const noKnownValueWidening: Rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow explicit broad types that discard syntactically known value evidence.',
        },
        messages: {
            widening:
                'The explicit {{target}} type discards known value evidence. Keep inference or use `satisfies` to validate the value.',
        },
    },
    create(context) {
        const report = (expression: ESTree.Expression, type: ESTree.TSType | null | undefined) => {
            if (type === null || type === undefined) return;
            const target = classifyBroadTarget(type);
            if (target === null || (target === 'open dictionary' && isEmptyObject(expression))) return;
            if (hasKnownValue(context.sourceCode, expression)) {
                context.report({ node: expression, messageId: 'widening', data: { target } });
            }
        };

        return {
            VariableDeclarator(node) {
                if (node.id.type === 'Identifier' && node.init !== null) {
                    report(node.init, node.id.typeAnnotation?.typeAnnotation);
                }
            },
            TSAsExpression(node) {
                if (node.parent.type !== 'TSAsExpression' && node.parent.type !== 'TSTypeAssertion') {
                    report(node.expression, node.typeAnnotation);
                }
            },
            TSTypeAssertion(node) {
                if (node.parent.type !== 'TSAsExpression' && node.parent.type !== 'TSTypeAssertion') {
                    report(node.expression, node.typeAnnotation);
                }
            },
        };
    },
};
