import { Visitor, types as t, NodePath } from '@babel/core';

const PACKAGE_NAME = 'next-data-hooks';

/** returns an identifier for a function from ./babel-utils.
 * automatically imports it if it is not already imported.
*/
function autoImportUtility(path: NodePath<any>, util: string) {
  const program = path.isProgram()
    ? path
    : path.findParent(p => p.isProgram()) as NodePath<t.Program>;
  if (!program) throw new Error("Cannot find Program node.");

  // find an import statement to the utility module
  let utilImport = program.get('body').find(x =>
    x.isImportDeclaration()
    && x.get('source').node.value === PACKAGE_NAME
    && !x.get('specifiers').some(s => s.isImportNamespaceSpecifier())
  ) as NodePath<t.ImportDeclaration>;

  // add a non-existing import
  if (!utilImport) {
    utilImport = program.unshiftContainer('body', t.importDeclaration([], t.stringLiteral(PACKAGE_NAME)))[0];
  }

  // find an import specifier to the desired module
  let utilImportId = utilImport.get('specifiers').find(x =>
    x.isImportSpecifier()
    && (x.get('imported').node as t.Identifier).name === util
  )?.node?.local;

  // add a non-existing specifier
  if (!utilImportId) {
    utilImportId = program.scope.generateUidIdentifier('util');
    utilImport.pushContainer(
      'specifiers',
      t.importSpecifier(utilImportId, t.identifier(util))
    );
  }

  return utilImportId;
}

const babelPlugin = (api: any): { visitor: Visitor } => {
  const isServer = api.caller((caller: any) => caller?.isServer);

  return {
    visitor: {
      CallExpression(path) {
        // Babel Transform: Wrap `createDataHook` inside of a `typeof window` check.

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
      FunctionDeclaration(path) {
        // Babel Transform: Add .dataHooks, but only on the server-side
        if (!isServer) return;
        if (!path.node.id?.name?.match(/^use[A-Z]|[A-Z][a-z]/)) return;

        const scope = path.parentPath.scope;
        const bindings = scope.getAllBindings();

        // get bindings that match the regex and are used inside the function
        const keys = Object.keys(bindings).filter((key) => {
          if (!key.match(/^use[A-Z]|^[A-Z][a-z]/)) return false;
          const binding = scope.getBinding(key);
          if(!binding) return false;
          return binding.referencePaths.some(p => p.findParent(x => x === path));
        });

        if (keys.length === 0) return

        const createDataHookArray = autoImportUtility(path, 'createDataHooksArray');

        // Add `Component.dataHooks = createDataHookArray(...)`
        path.insertAfter(
          t.assignmentExpression(
            '=',
            t.memberExpression(path.node.id, t.identifier('dataHooks')),
            t.callExpression(createDataHookArray, keys.map(k => t.identifier(k)))
          )
        );
      },
    },
  }
};

export default babelPlugin;
