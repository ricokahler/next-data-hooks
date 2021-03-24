import { GetServerSideProps, GetStaticPropsContext } from 'next';
import useData from './use-data';

/**
 * Creates a data hook.
 *
 * @param key The key to uniquely identify this data hooks from other on the same page.
 * @param getData An async for data that will be called via `getStaticProps` in next.js
 * @return A hook that can be used in any component within the page's React tree
 */
function createDataHook<R>(
  key: string,
  getData: (context: GetStaticPropsContext | GetServerSideProps) => Promise<R>
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
    server: false,
  });
}

export default createDataHook;
