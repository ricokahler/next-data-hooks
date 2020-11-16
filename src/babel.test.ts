import { transform } from '@babel/core';
import babelPlugin from './babel';

it('takes in a createDataHook expression prepends it for code elimination', () => {
  const result = transform(
    `
      import { createDataHook } from 'next-data-hooks';
      
      const useBlogPost = createDataHook('BlogPost', async () => {
        return { hello: 'world' };
      });

      export default useBlogPost;
    `,
    {
      babelrc: false,
      plugins: [babelPlugin],
    }
  )!;

  expect(result.code).toMatchInlineSnapshot(`
    "import { createDataHook } from 'next-data-hooks';
    const useBlogPost = typeof window !== \\"undefined\\" ? createDataHook(\\"BlogPost\\") : createDataHook('BlogPost', async () => {
      return {
        hello: 'world'
      };
    });
    export default useBlogPost;"
  `);
});
