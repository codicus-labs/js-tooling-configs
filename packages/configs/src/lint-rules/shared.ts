import type { ESTree, Scope, SourceCode, Variable } from '@oxlint/plugins';

export type TypeAssertion = ESTree.TSAsExpression | ESTree.TSTypeAssertion;

type Positioned = {
    readonly start: number;
    readonly end: number;
    readonly range?: readonly [number, number];
};

export function nodeStart(node: Positioned): number {
    return node.range?.[0] ?? node.start;
}

export function nodeEnd(node: Positioned): number {
    return node.range?.[1] ?? node.end;
}

export function isTypeAssertion(node: ESTree.Node): node is TypeAssertion {
    return node.type === 'TSAsExpression' || node.type === 'TSTypeAssertion';
}

export function unwrapExpression(expression: ESTree.Expression): ESTree.Expression {
    let current = expression;
    while (current.type === 'ParenthesizedExpression') current = current.expression;
    return current;
}

export function unwrapType(type: ESTree.TSType): ESTree.TSType {
    let current = type;
    while (current.type === 'TSParenthesizedType') current = current.typeAnnotation;
    return current;
}

export function isConstAssertion(node: TypeAssertion): boolean {
    const type = unwrapType(node.typeAnnotation);
    return type.type === 'TSTypeReference' && type.typeName.type === 'Identifier' && type.typeName.name === 'const';
}

export function resolveVariable(sourceCode: SourceCode, identifier: ESTree.IdentifierReference): Variable | null {
    let scope: Scope | null = sourceCode.getScope(identifier);
    while (scope !== null) {
        const variable = scope.set.get(identifier.name);
        if (variable !== undefined) return variable;
        scope = scope.upper;
    }
    return null;
}

export function variableDeclarator(variable: Variable): ESTree.VariableDeclarator | null {
    if (variable.defs.length !== 1) return null;
    const [definition] = variable.defs;
    return definition?.type === 'Variable' && definition.node.type === 'VariableDeclarator' ? definition.node : null;
}

export function isStableConst(variable: Variable, declarator: ESTree.VariableDeclarator): boolean {
    return (
        declarator.parent.type === 'VariableDeclaration' &&
        declarator.parent.kind === 'const' &&
        variable.references.every((reference) => reference.init || !reference.isWrite())
    );
}
