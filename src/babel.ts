import { Visitor, types as t, NodePath, PluginPass } from '@babel/core';

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
  let utilImport = program.get('body').find(x =>
    x.isImportDeclaration()
    && x.get('source').node.value === IMPORT_UTILS
    && !x.get('specifiers').some(s => s.isImportNamespaceSpecifier())
  ) as NodePath<t.ImportDeclaration>;

  // add a non-existing import
  if (!utilImport) {
    utilImport = program.unshiftContainer('body', t.importDeclaration([], t.stringLiteral(IMPORT_UTILS)))[0];
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

/** Checks if a PluginPass is running on a next.js page file */
function isPage({ filename, cwd }: PluginPass) {
  if (!filename.startsWith(cwd)) return false;
  const sliced = filename.slice(cwd.length + 1);
  // check if the relative path starts with pages/ or src/pages, and that it
  // does not end in _app, _document, or _error (any extension)
  return sliced.match(/^(?:src\/)?pages\//)
    && !sliced.match(/_(?:app|document|error)\.[a-z]*$/);
}

const dataFetcherName = ['getStaticProps', 'getServerSideProps'];

/** Given a Program node, attempts to find an exported `getStaticProps` or `getServerSideProps` function.
 *  The found function is converted to an expression if it is not already, then the expression is returned.
 */
function findNextDataFetcher(path: NodePath<t.Program>) {
  for (const statement of path.get('body')) {
    // Export Named Declarations
    if (statement.isExportNamedDeclaration()) {
      const dec = statement.get('declaration');
      // export function getStaticProps() { ... }
      if (dec.isFunctionDeclaration()) {
        if (dec.node.id && dataFetcherName.includes(dec.node.id.name)) {
          // transform the function declaration to a var ... = function ...
          // that way we can wrap it later.
          const [varDeclaration] = dec.replaceWith(t.variableDeclaration('var', [
            t.variableDeclarator(
              dec.node.id,
              t.functionExpression(
                dec.node.id,
                dec.node.params,
                dec.node.body,
                dec.node.generator,
                dec.node.async,
              )
            )
          ]));
          // manual traversal to the FunctionExpression
          return varDeclaration.get('declarations')[0].get('init');
        }
      }
      // export const getStaticProps = ...;
      else if (dec.isVariableDeclaration()) {
        for (const variable of dec.get('declarations')) {
          if (dataFetcherName.includes((variable.node.id as t.Identifier).name)) {
            return variable.get('init');
          }
        }
      }
    }
  }
  return null;
}

/** Given a Program node, attempts to find the default export, then get it's identifier.
 * If it is not an identifier, generate one.
 */
function findDefaultExportIdentifier(path: NodePath<t.Program>) {
  const def = path.get('body').find(x => x.isExportDefaultDeclaration()) as NodePath<t.ExportDefaultDeclaration>;
  if (!def) return null;

  const dec = def.get('declaration')
  if (dec.isIdentifier()) return dec.node;
  if (dec.isTSDeclareFunction()) return null; // i don't think this is realistically possible???

  if (dec.isFunctionDeclaration() || dec.isClassDeclaration()) {
    if (!dec.node.id) dec.node.id = dec.scope.generateUidIdentifier('default');
    return dec.node.id;
  }

  // generate + extract
  const id = dec.scope.generateUidIdentifierBasedOnNode(dec.node, 'default');
  def.replaceWithMultiple([
    t.variableDeclaration('var', [
      t.variableDeclarator(
        id,
        dec.node as t.Expression
      )
    ]),
    t.exportDefaultDeclaration(id)
  ]);

  return id;
}

const babelPlugin = (api: any): { visitor: Visitor<PluginPass> } => {
  const isServer = api.caller((caller: any) => caller?.isServer);

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
        // *technically*, this could transform other functions with this name, but whatever
        if (path.node.callee.name !== 'createDataHook') return;

        const [firstArgument] = path.node.arguments;
        if (!t.isStringLiteral(firstArgument)) return;

        const createClientDataHook = autoImportUtility(path, 'createClientDataHook');

        path.node.callee = createClientDataHook;
        path.node.arguments = [firstArgument];
      },
      Program(path, state) {
        // Babel Transform: Add or transform `getStaticProps`/`getServerSideProps`
        if (!isPage(state)) return

        // Backwards compatibility, disable this transformation if `getDataHooksProps` is already used
        if (path.scope.hasBinding('getDataHooksProps')) return;
        if (path.scope.hasBinding('createGetStaticProps')) return;

        const pageComponent = findDefaultExportIdentifier(path);
        if (!pageComponent) return;

        const dataFetcher = findNextDataFetcher(path);
        const createGetStaticProps = autoImportUtility(path, 'createGetStaticProps');
        const pageDataHooks = t.memberExpression(pageComponent, t.identifier('dataHooks'));

        if (dataFetcher && dataFetcher.node) {
          // replace an existing function with a wrapper
          dataFetcher.replaceWith(
            t.callExpression(
              createGetStaticProps,
              [pageDataHooks, dataFetcher.node]
            )
          )
        } else {
          // add an `export var getStaticProps = ...`
          path.pushContainer('body',
            t.exportNamedDeclaration(
              t.variableDeclaration(
                'var',
                [t.variableDeclarator(
                  t.identifier('getStaticProps'),
                  t.callExpression(
                    createGetStaticProps,
                    [pageDataHooks]
                  )
                )]
              )
            )
          )
        }
      }
    },
  }
};

export default babelPlugin;
