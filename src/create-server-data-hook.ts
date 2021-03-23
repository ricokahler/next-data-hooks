import { GetServerSidePropsContext } from 'next';
import useData from './use-data';

/**
 * Creates a server data hook, the `getServerSideProps` equivilent of `createDataHook`
 *
 * @param key The key to uniquely identify this data hooks from other on the same page.
 * @param getData An async for data that will be called via `getServerSideProps` in next.js
 * @return A hook that can be used in any component within the page's React tree
 */
function createServerDataHook<R>(
  key: string,
  getData: (context: GetServerSidePropsContext) => Promise<R>
) {
  // The babel plugin rewrites function calls to this, so this should never be directly called.
  if (typeof window !== 'undefined') {
    throw new Error(
      'Create data hook was run in the browser. See https://github.com/ricokahler/next-data-hooks#code-elimination'
    );
  }

  return Object.assign(() => useData<R>(key), {
    key,
    getData: getData,
    server: true,
  });
}

export default createServerDataHook;
