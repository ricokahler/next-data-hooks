import { createContext } from 'react';

interface NextDataHooksContextValue {
  [key: string]: any;
}

/**
 * Context used by `next-data-hooks` to pull static data
 */
const NextDataHooksContext = createContext<NextDataHooksContextValue | null>(
  null
);

export default NextDataHooksContext;
