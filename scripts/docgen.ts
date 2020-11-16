import path from 'path';
import fs from 'fs';
import {
  compileDeclarations,
  createRoot,
  query,
  queryAll,
  is,
  find,
  child,
  adjacent,
  wildcard,
} from '@ricokahler/ast-docgen';
import { stripIndents } from 'common-tags';
import { SyntaxKind as t } from 'typescript';
import prettier from 'prettier';

async function docgen() {
  const declarations = compileDeclarations([
    path.resolve(__dirname, '../src/create-data-hook.ts'),
    path.resolve(__dirname, '../src/create-data-hooks-props.ts'),
    path.resolve(__dirname, '../src/next-data-hooks-context.ts'),
    path.resolve(__dirname, '../src/next-data-hooks-provider.tsx'),
  ]);

  const parsed = declarations
    .map(parseDeclaration)
    .map((x) => {
      console.log(x);
      return x;
    })
    .map((result) => {
      if (result?.type === 'functionDeclaration') {
        return stripIndents`
        ### \`${result.functionName}(${result.params
          .map(({ name }) => name)
          .join(', ')})\`

        ${result.description}

        **Params**

        | Name | Type | Description |
        |-|-|-|
        ${result.params
          .map(({ name, type, description }) =>
            [`\`${name}\``, `\`${type}\``, description]
              .map((x) => x.replace(/\|/g, '\\|').replace(/\n/g, ' '))
              .join(' | ')
          )
          .map((x) => `| ${x} |`)
          .join('\n')}

        **Return**

        ${result.returnDescription}

        \`\`\`
        ${result.returnType
          .split('\n')
          .map((line) => line.trim())
          .join(' ')}
        \`\`\`
      `;
      }

      return '';
    });

  const readme = (
    await fs.promises.readFile(path.resolve(__dirname, '../README.md'))
  ).toString();

  const [before, afterBefore] = readme.split('<!-- DOCSTART -->');
  const [, after] = afterBefore.split('<!-- DOCEND -->');

  await fs.promises.writeFile(
    path.resolve(__dirname, '../README.md'),
    prettier.format(`${before}\n<!-- DOCSTART -->\n${parsed.join('\n\n')}\n<!-- DOCEND -->\n${after}`, {
      parser: 'markdown',
      singleQuote: true,
    })
  );
}

const isTruthy = <T>(t: T): t is NonNullable<T> => !!t;

function parseDeclaration(declaration: string) {
  const root = createRoot(declaration);

  const functionDeclaration = query(root, find(is(t.FunctionDeclaration)));

  if (functionDeclaration) {
    const functionNameIdentifiers = queryAll(
      functionDeclaration,
      child(is(t.FunctionKeyword)),
      adjacent(is(t.Identifier))
    );
    const [functionNameIdentifier] = functionNameIdentifiers;
    const functionName = functionNameIdentifier.getText();

    const paramTypes = queryAll(
      functionDeclaration,
      child(is(t.OpenParenToken)),
      adjacent(is(t.SyntaxList)),
      child(wildcard)
    )
      .map((param) => {
        const identifier = query(param, find(is(t.Identifier)));
        if (!identifier) return null;

        const name = identifier.getText();
        const typeNode = query(
          param,
          child(is(t.ColonToken)),
          adjacent(wildcard)
        );

        if (!typeNode) return null;
        const type = typeNode.getText();

        return { name, type };
      })
      .filter(isTruthy);

    const returnType =
      query(
        functionDeclaration,
        child(is(t.ColonToken)),
        adjacent(wildcard)
      )?.getText() || '';

    const jsdocComment = query(functionDeclaration, find(is(t.JSDocComment)));

    const jsdocParams =
      (jsdocComment &&
        queryAll(jsdocComment, child(is(t.JSDocParameterTag)))) ||
      [];

    const commentText = jsdocComment?.getText();
    const atStart = commentText?.indexOf('@');
    const rawDescription =
      commentText?.substring(0, atStart === -1 ? undefined : atStart) || '';
    const description = rawDescription
      .split('\n')
      .map((line) =>
        line
          .replace(/^\s*\*\s*/m, '')
          .replace(/\s*\*\s*$/m, '')
          .trim()
      )
      .join('\n')
      .replace(/^\/\*/, '')
      .replace(/\*?\/$/, '');

    const paramsDocs = jsdocParams
      .map((paramTag) => {
        const paramNameNode = query(
          paramTag,
          child(is(t.Identifier)),
          adjacent(wildcard)
        );
        if (!paramNameNode) return null;
        const name = paramNameNode.getText();

        const description = declaration
          .substring(paramNameNode.end, paramTag.end)
          .replace(/^\s*\*\s*/m, '')
          .replace(/\s*\*\s*$/m, '')
          .trim();
        return { name, description };
      })
      .filter(isTruthy);

    const params = paramTypes.map(({ name, type }) => {
      const docInfo = paramsDocs.find((i) => i.name === name);
      const description = docInfo?.description || '';

      return { name, type, description };
    });

    const returnTagEnd =
      jsdocComment && query(jsdocComment, find(is(t.JSDocReturnTag)))?.end;
    const returnDescription = (
      (jsdocComment &&
        returnTagEnd &&
        declaration.substring(returnTagEnd, jsdocComment.end)) ||
      ''
    ).replace(/\*\/$/, '');

    return {
      type: 'functionDeclaration' as 'functionDeclaration',
      functionName,
      params,
      returnType,
      returnDescription,
      description,
    };
  }
}

docgen().catch((e) => {
  console.error(e);
  process.exit(1);
});
