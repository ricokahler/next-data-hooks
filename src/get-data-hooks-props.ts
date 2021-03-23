import { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import createDataHook from './create-data-hook';
import isServerSidePropsContext from './is-server-side-props-context';

type DataHook = ReturnType<typeof createDataHook>;

interface Params {
  context: GetStaticPropsContext | GetServerSidePropsContext;
  dataHooks: DataHook[];
}

/**
 * Pulls the data from the next-data-hooks and returns the props to be received
 * by the NextDataHooksProvider
 */
async function getDataHooksProps({ dataHooks, context }: Params) {
  const isServerContext = isServerSidePropsContext(context);

  const hookKeys: { [key: string]: boolean } = {};

  // we allow the same function reference to be added to the array more than
  // once so we de-dupe here
  const deDupedHooks = Array.from(new Set(dataHooks));

  for (const hook of deDupedHooks) {
    if (hookKeys[hook.key]) {
      throw new Error(
        `Found duplicate hook key "${hook.key}". Ensure all hook keys per \`createDataHooksProps\` call are unique.`
      );
    }
    hookKeys[hook.key] = true;
  }

  const invalidSSPHook = !isServerContext && dataHooks.find(hook => hook.server);
  if (invalidSSPHook) {
    throw new Error(
      `Found ServerSideProps hook with key "${invalidSSPHook.key}" called with \`getStaticProps\`. Switch to \`getServerSideProps\``
    );
  }

  const entries = await Promise.all(
    dataHooks.map(async (hook) => {
      const data = await hook.getData(context);
      return [hook.key, data] as [string, any];
    })
  );

  return {
    nextDataHooks: Object.fromEntries(entries),
  };
}

export default getDataHooksProps;
