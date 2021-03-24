import { Visitor, types as t, NodePath } from '@babel/core';

const IMPORT_DATA_HOOK = 'next-data-hooks';
const IMPORT_UTILS = 'next-data-hooks';

/** returns an identifier for a function from ./babel-utils.
 * automatically imports it if it is not already imported.
*/
function autoImportUtility(path: NodePath<any>, util: string) {
  const program = path.isProgram()
    ? path
    : path.findParent(p => p.isProgram()) as NodePath<t.Program>;
  if (!program) throw new Error("Cannot find Program node.");

  // find an import statement to the utility module
  let utilImport = program.node.body.find(x =>
    x.type === 'ImportDeclaration'
    && x.source.value === IMPORT_UTILS
    && !x.specifiers.some(s => s.type === 'ImportNamespaceSpecifier')
  ) as t.ImportDeclaration;

  // add a non-existing import
  if (!utilImport) {
    utilImport = program.unshiftContainer('body', t.importDeclaration([], t.stringLiteral(IMPORT_UTILS)))[0].node;
  }

  // find an import specifier to the desired module
  let utilImportId = utilImport.specifiers.find(x => x.type === 'ImportSpecifier' && (x.imported as t.Identifier).name === util)?.local;

  // add a non-existing specifier
  if (!utilImportId) {
    utilImportId = program.scope.generateUidIdentifier('util');
    utilImport.specifiers.push(
      t.importSpecifier(utilImportId, t.identifier(util))
    );
  }

  return utilImportId;
}

const babelPlugin = (api: any): { visitor: Visitor } => {
  const isServer = api.caller((caller: any) => caller?.isServer);
  const isPageFile = false;

  return {
    visitor: {
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
      CallExpression(path) {
        // Babel Transform: Transform `createDataHook` to `createClientDataHook`
        if (isServer) return;

        if (!t.isIdentifier(path.node.callee)) return;
        if (path.node.callee.name !== 'createDataHook') return;

        const [firstArgument] = path.node.arguments;
        if (!t.isStringLiteral(firstArgument)) return;

        const createClientDataHook = autoImportUtility(path, 'createClientDataHook');

        path.node.callee = createClientDataHook;
        path.node.arguments = [firstArgument];

        // TODO: might need to do some kind of tree-shaking on used imports.
      },
    },
  }
};

export default babelPlugin;
