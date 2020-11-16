import { Visitor, types as t } from '@babel/core';

/**
 * TODO: docs
 */
const babelPlugin = (): { visitor: Visitor } => ({
  visitor: {
    CallExpression(path) {
      // prevents infinitely loops
      if (t.isConditionalExpression(path.parent)) return;

      if (!t.isIdentifier(path.node.callee)) return;
      if (path.node.callee.name !== 'createDataHook') return;

      const [firstArgument] = path.node.arguments;
      if (!firstArgument) return;
      if (!t.isStringLiteral(firstArgument)) return;
      const dataKey = firstArgument.value;

      path.replaceWith(
        t.conditionalExpression(
          t.binaryExpression(
            '!==',
            t.unaryExpression('typeof', t.identifier('window')),
            t.stringLiteral('undefined')
          ),
          t.callExpression(t.identifier('createDataHook'), [
            t.stringLiteral(dataKey),
          ]),
          path.node
        )
      );
    },
  },
});

export default babelPlugin;
