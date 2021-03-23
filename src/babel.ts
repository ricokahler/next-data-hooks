import { Visitor, types as t, NodePath } from '@babel/core';

const IMPORT_DATA_HOOK = 'next-data-hooks';
const IMPORT_UTILS = 'next-data-hooks';

/** returns a MemberExpression resulting in a function from ./babel-utils.
 * automatically imports it if it is not already imported.
*/
function autoImportUtility(program: NodePath<t.Program>, util: string) {
  let utilImport = program.node.body.find(x =>
    x.type === 'ImportDeclaration'
    && x.source.value === IMPORT_UTILS
    && !x.specifiers.some(s => s.type === 'ImportNamespaceSpecifier')
  ) as t.ImportDeclaration;

  let utilImportId: t.Identifier | undefined;

  if (utilImport) {
    utilImportId = utilImport.specifiers.find(x => x.type === 'ImportSpecifier' && (x.imported as t.Identifier).name === util)?.local;

    if (!utilImportId) {
      utilImportId = program.scope.generateUidIdentifier('util');
      utilImport.specifiers.push(
        t.importSpecifier(utilImportId, t.identifier(util))
      );
    }
  } else {
    utilImportId = program.scope.generateUidIdentifier('util');

    utilImport = program.unshiftContainer(
      'body',
      t.importDeclaration(
        [t.importSpecifier(utilImportId, t.identifier(util))],
        t.stringLiteral(IMPORT_UTILS)
      )
    )[0].node;
  }

  return utilImportId;
}

function isPageFile(state: any) {
  return !!state.filename.slice(state.cwd.length).match(/\/?(src\/)?pages\//);
}

// this is kind of a hack, as next.js defines the bigint syntax plugin, but they may remove it in
// a future version.
function isServer(state: any) {
  return state.file.opts.plugins.some((x: any) => x.key.includes('syntax-bigint'));
}

const babelPlugin = (): { visitor: Visitor } => ({
  visitor: {
    FunctionDeclaration(path, state) {
      if (!isServer(state)) return;

      if (!path.node.id?.name?.match(/^use[A-Z]|[A-Z][a-z]/)) {
        return;
      }

      const scope = path.parentPath.scope;
      const bindings = scope.getAllBindings();

      const keys = Object.keys(bindings).filter((key) => {
        if (!key.match(/^use[A-Z]|^[A-Z][a-z]/)) return false;
        const binding = scope.getBinding(key);
        if(!binding) return false;
        return binding.referencePaths.some(p => p.findParent(x => x === path));
      });

      if (keys.length > 0) {
        const program = path.findParent(p => p.isProgram()) as NodePath<t.Program>;
        if (!program) throw new Error("Cannot find Program node.");

        const createDataHookArray = autoImportUtility(program, 'createDataHooksArray');

        path.insertAfter(
          t.expressionStatement(
            t.assignmentExpression(
              '=',
              t.memberExpression(
                path.node.id,
                t.identifier('dataHooks')
              ),
              t.callExpression(
                createDataHookArray,
                keys.map(k => t.identifier(k))
              )
            )
          )
        );
      }
    },
    CallExpression(path, state) {
      if (isServer(state)) return;

      if (!t.isIdentifier(path.node.callee)) return;
      if (path.node.callee.name !== 'createDataHook') return;

      const [firstArgument] = path.node.arguments;
      if (!firstArgument) return;
      if (!t.isStringLiteral(firstArgument)) return;

      const program = path.findParent(p => p.isProgram()) as NodePath<t.Program>;
      if (!program) throw new Error("Cannot find Program node.");

      const createClientDataHook = autoImportUtility(program, 'createClientDataHook');

      path.node.callee = createClientDataHook;
      path.node.arguments = [firstArgument];

      // TODO: might need to do some kind of tree-shaking on used imports.
    },
    ExportDefaultDeclaration(path, state) {
      if (!isServer(state)) return;
      if (!isPageFile(state)) return;

      const program = path.findParent(p => p.isProgram()) as NodePath<t.Program>;
      if (!program) throw new Error("Cannot find Program node.");

      let componentId: t.Identifier;

      if (path.node.declaration.type === 'Identifier') {
        componentId = path.node.declaration;
      } else if (path.node.declaration.type === 'FunctionDeclaration') {
        // TODO: unnamed default functions will break here
        componentId = path.node.declaration.id!;
      } else {
        componentId = program.scope.generateUidIdentifier('default');
        path.insertBefore(
          t.variableDeclaration('const', [
            t.variableDeclarator(componentId, path.node.declaration as any)
          ])
        );
      }

      componentId = path.scope.getBindingIdentifier(componentId.name);

      const existing = (
        program.scope.getBinding('getStaticProps')
        || program.scope.getBinding('getServerSideProps')
      );

      if (existing) {
        const wrapNextDataFetcher = autoImportUtility(program, 'wrapNextDataFetcher');
        const gsp = existing.path;
        if (gsp.node.type === 'VariableDeclarator') {
          (gsp as NodePath<t.VariableDeclarator>).get('init').replaceWith(
            t.callExpression(
              wrapNextDataFetcher, [
                t.memberExpression(componentId, t.identifier('dataHooks')),
                gsp.node.init ?? t.nullLiteral()
              ]
            )
          )
        } else if(gsp.node.type === 'FunctionDeclaration') {
          gsp.replaceWith(
            t.variableDeclaration('const', [
              t.variableDeclarator(
                existing.identifier,
                t.callExpression(wrapNextDataFetcher, [
                  t.memberExpression(componentId, t.identifier('dataHooks')),
                  t.functionExpression(
                    existing.identifier,
                    gsp.node.params,
                    gsp.node.body,
                    gsp.node.generator,
                    gsp.node.async,
                  )
                ])
              )
            ])
          );
        }
      } else {
        const injectNextDataFetcher = autoImportUtility(program, 'injectNextDataFetcher');

        path.insertAfter([
          t.callExpression(injectNextDataFetcher, [
            t.memberExpression(componentId, t.identifier('dataHooks')),
            t.memberExpression(t.identifier('module'), t.identifier('exports')),
          ])
        ])
      }
    },
  },
});

export default babelPlugin;
