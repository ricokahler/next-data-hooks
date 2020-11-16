import { GetStaticPropsContext } from 'next';
import createDataHook from './create-data-hook';

type DataHook = ReturnType<typeof createDataHook>;

/**
 * Given an array of data hooks created with `createDataHooks`, this function
 * returns a function that be used as a `getStaticProps` implementation.
 *
 * @param hooks an array of data hooks created with `createDataHooks`
 * @return a `getStaticProps` implementation
 */
function createDataHooksProps(hooks: DataHook[]) {
  const hookKeys: { [key: string]: boolean } = {};
  for (const hook of hooks) {
    if (hookKeys[hook.key]) {
      throw new Error(
        `Found duplicate hook key "${hook.key}". Ensure all hook keys per \`createDatHooksProps\` call are unique.`
      );
    }
    hookKeys[hook.key] = true;
  }

  async function getStaticProps(context: GetStaticPropsContext) {
    const entries = await Promise.all(
      hooks.map(async (hook) => {
        const data = await hook.getData(context);
        return [hook.key, data] as [string, any];
      })
    );

    return {
      props: {
        nextDataHooks: Object.fromEntries(entries),
      },
    };
  }

  return getStaticProps;
}

export default createDataHooksProps;
