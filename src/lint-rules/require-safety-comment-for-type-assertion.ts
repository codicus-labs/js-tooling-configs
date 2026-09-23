import type { ESTree, Rule, SourceCode } from '@oxlint/plugins';

import { isConstAssertion, nodeEnd, nodeStart, type TypeAssertion } from './shared.js';

const commentOwners = new Set([
    'ExportDefaultDeclaration',
    'ExpressionStatement',
    'PropertyDefinition',
    'ReturnStatement',
    'ThrowStatement',
    'VariableDeclaration',
]);

function isStatementOrDeclaration(node: ESTree.Node): boolean {
    return node.type.endsWith('Statement') || node.type.endsWith('Declaration');
}

function hasSafetyExplanation(commentValue: string): boolean {
    const undecoratedValue = commentValue.replace(/^[\t ]*\*[\t ]?/gmu, '');
    return /\bSAFETY\s*:[^\p{L}\p{N}]*[\p{L}\p{N}]/u.test(undecoratedValue);
}

function hasSafetyComment(sourceCode: SourceCode, node: TypeAssertion): boolean {
    let current: ESTree.Node = node;

    while (true) {
        if (isStatementOrDeclaration(current) && !commentOwners.has(current.type)) return false;

        if (
            sourceCode
                .getCommentsBefore(current)
                .some((comment) => nodeEnd(comment) <= nodeStart(node) && hasSafetyExplanation(comment.value))
        ) {
            return true;
        }

        if (commentOwners.has(current.type)) {
            const parent = current.parent;
            const owner =
                parent.type === 'ExportNamedDeclaration' || parent.type === 'ExportDefaultDeclaration'
                    ? parent
                    : current;
            return sourceCode
                .getAllComments()
                .some(
                    (comment) =>
                        nodeEnd(comment) <= nodeStart(owner) &&
                        hasSafetyExplanation(comment.value) &&
                        sourceCode.text.slice(nodeEnd(comment), nodeStart(owner)).trim() === '',
                );
        }
        if (current.parent.type === 'Program') return false;
        current = current.parent;
    }
}

export const requireSafetyCommentForTypeAssertion: Rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Require non-const type assertions to document the invariant that makes them safe.',
        },
        messages: {
            missing:
                'Document the checked invariant with a `SAFETY:` comment immediately before this assertion or its statement.',
        },
    },
    create(context) {
        const check = (node: TypeAssertion) => {
            if (!isConstAssertion(node) && !hasSafetyComment(context.sourceCode, node)) {
                context.report({ node, messageId: 'missing' });
            }
        };

        return {
            TSAsExpression: check,
            TSTypeAssertion: check,
        };
    },
};
