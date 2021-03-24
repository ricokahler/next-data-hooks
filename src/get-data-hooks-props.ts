import { GetStaticPropsContext } from 'next';
import { ComponentType } from 'react';
import createDataHook from './create-data-hook';

type DataHook = ReturnType<typeof createDataHook>;

interface Params {
  context: GetStaticPropsContext;
  dataHooks: DataHook[] | ComponentType;
}

/**
 * Pulls the data from the next-data-hooks and returns the props to be received
 * by the NextDataHooksProvider
 */
async function getDataHooksProps({ dataHooks, context }: Params) {
  const hookKeys: { [key: string]: boolean } = {};

  const hooks: DataHook[] = (dataHooks as any).dataHooks || dataHooks;

  // we allow the same function reference to be added to the array more than
  // once so we de-dupe here
  const deDupedHooks = Array.from(new Set(hooks));

  for (const hook of deDupedHooks) {
    if (hookKeys[hook.key]) {
      throw new Error(
        `Found duplicate hook key "${hook.key}". Ensure all hook keys per \`createDataHooksProps\` call are unique.`
      );
    }
    hookKeys[hook.key] = true;
  }

  const entries = await Promise.all(
    deDupedHooks.map(async (hook) => {
      const data = await hook.getData(context);
      return [hook.key, data] as [string, any];
    })
  );

  return {
    nextDataHooks: Object.fromEntries(entries),
  };
}

export default getDataHooksProps;
