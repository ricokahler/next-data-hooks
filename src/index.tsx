import React, { createContext, forwardRef, useContext } from 'react';
import { GetStaticPropsContext } from 'next';

type Unwrap<T> = T extends Promise<infer U> ? U : T;

interface DataHooksContextValue {
  [key: string]: any;
}

function createHookFactory<Variables>(
  contextToVariables: (context: GetStaticPropsContext) => Variables
) {
  const dataFns: { [key: string]: (variables: Variables) => any } = {};

  const DataHooksContext = createContext<DataHooksContextValue | null>(null);

  function createDataHook<R>(
    key: string,
    getData: (variables: Variables) => R | Promise<R>
  ) {
    function useHook(): Unwrap<R> {
      const context = useContext(DataHooksContext);
      if (!context) {
        throw new Error(
          'Could not find next-data-hooks context. TODO: add shortlink to docs'
        );
      }

      if (!context.hasOwnProperty(key)) {
        throw new Error(
          'Could not data from context. TODO: add shortlink to docs'
        );
      }

      return context[key];
    }

    if (dataFns[key]) {
      throw new Error(
        `You already have data hook registered with key "${key}". TODO: add shortlink to docs`
      );
    }
    dataFns[key] = getData;

    return useHook;
  }

  async function getStaticProps(context: GetStaticPropsContext) {
    const variables = contextToVariables(context);

    const dataHooksEntries = await Promise.all(
      Object.entries(dataFns).map(async ([key, getData]) => {
        const data = await getData(variables);
        return { key, data };
      })
    );

    const dataHooksValues = dataHooksEntries.reduce((acc, { key, data }) => {
      acc[key] = data;
      return acc;
    }, {} as { [key: string]: any });

    return {
      props: {
        __dataHooksValues: dataHooksValues,
      },
    };
  }

  function withDataHooks(Component: React.ComponentType<any>) {
    return forwardRef(({ __dataHooksValues, ...restOfProps }: any, ref) => {
      return (
        <DataHooksContext.Provider value={__dataHooksValues}>
          <Component ref={ref} {...restOfProps} />
        </DataHooksContext.Provider>
      );
    });
  }

  return {
    createDataHook,
    getStaticProps,
    withDataHooks,
  };
}

export default createHookFactory;
