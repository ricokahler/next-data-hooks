import { GetStaticPropsContext } from 'next';
import createDataHook from './create-data-hook';

type DataHook = ReturnType<typeof createDataHook>;

interface Params {
  context: GetStaticPropsContext;
  hooks: DataHook[];
}

/**
 * Pulls the data from the next-data-hooks and returns the props to be received
 * by the NextDataHooksProvider
 */
async function getDataHooksProps({ hooks, context }: Params) {
  const hookKeys: { [key: string]: boolean } = {};
  for (const hook of hooks) {
    if (hookKeys[hook.key]) {
      throw new Error(
        `Found duplicate hook key "${hook.key}". Ensure all hook keys per \`createDatHooksProps\` call are unique.`
      );
    }
    hookKeys[hook.key] = true;
  }

  const entries = await Promise.all(
    hooks.map(async (hook) => {
      const data = await hook.getData(context);
      return [hook.key, data] as [string, any];
    })
  );

  return {
    nextDataHooks: Object.fromEntries(entries),
  };
}

export default getDataHooksProps;
