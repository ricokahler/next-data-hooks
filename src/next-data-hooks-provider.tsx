import React from 'react';
import NextDataHooksContext from './next-data-hooks-context';

/**
 * Injects the data from data hooks into React Context.
 */
function NextDataHooksProvider({ nextDataHooks, children }: any) {
  return (
    <NextDataHooksContext.Provider value={nextDataHooks}>
      {children}
    </NextDataHooksContext.Provider>
  );
}

export default NextDataHooksProvider;
