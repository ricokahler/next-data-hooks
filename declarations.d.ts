import { GetStaticPropsContext } from 'next';
declare type Unwrap<T> = T extends Promise<infer U> ? U : T;
/**
 * Creates a data hook.
 *
 * @param key The key to uniquely identify this data hooks from other on the same page.
 * @param getData An async for data that will be called via `getStaticProps` in next.js
 * @return A hook that can be used in any component within the page's React tree
 */
declare function createDataHook<R>(key: string, getData: (variables: GetStaticPropsContext) => R | Promise<R>): (() => Unwrap<R>) & {
    getData: (variables: GetStaticPropsContext) => R | Promise<R>;
    key: string;
};
export default createDataHook;

import { GetStaticPropsContext } from 'next';
import createDataHook from './create-data-hook';
declare type DataHook = ReturnType<typeof createDataHook>;
/**
 * Given an array of data hooks created with `createDataHooks`, this function
 * returns a function that be used as a `getStaticProps` implementation.
 *
 * @param hooks an array of data hooks created with `createDataHooks`
 * @return a `getStaticProps` implementation
 */
declare function createDataHooksProps(hooks: DataHook[]): (context: GetStaticPropsContext) => Promise<{
    props: {
        nextDataHooks: any;
    };
}>;
export default createDataHooksProps;

/// <reference types="react" />
interface NextDataHooksContextValue {
    [key: string]: any;
}
/**
 * React Context used by `next-data-hooks` to pull static data.
 */
declare const NextDataHooksContext: import("react").Context<NextDataHooksContextValue>;
export default NextDataHooksContext;

/// <reference types="react" />
/**
 * Injects the data from data hooks into React Context. Place this in `_app`
 */
declare function NextDataHooksProvider({ nextDataHooks, children }: any): JSX.Element;
export default NextDataHooksProvider;
