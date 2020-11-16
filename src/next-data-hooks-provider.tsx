import React from 'react';
import NextDataHooksContext from './next-data-hooks-context';

/**
 * Injects the data from data hooks into React Context.
 */
function NextDataHooksProvider({ __dataHooksContextValue, children }: any) {
  return (
    <NextDataHooksContext.Provider value={__dataHooksContextValue}>
      {children}
    </NextDataHooksContext.Provider>
  );
}

export default NextDataHooksProvider;
