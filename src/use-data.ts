import { useContext } from 'react';
import NextDataHooksContext from './next-data-hooks-context';

/**
 * React hook to retrieve data via the given key. Used by `createDataHook` and `createServerDataHook`
 *
 * @private
 * @param key
 * @returns
 */
function useData<R>(key: string): R {
  const dataHooksContext = useContext(NextDataHooksContext);
  if (!dataHooksContext) {
    throw new Error(
      'Could not find `NextDataHooksContext`. Ensure `NextDataHooksProvider` is configured correctly.'
    );
  }
  const dataHooksValue = dataHooksContext[key];
  if (!Object.keys(dataHooksContext).includes(key)) {
    throw new Error(
      `Did not find a data hook named "${key}". Ensure it was provided to getDataHooksProps.`
    );
  }

  return dataHooksValue;
}

export default useData;
