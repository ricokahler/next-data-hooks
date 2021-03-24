import React from 'react';
import App, { AppProps } from "next/app";
import { AppType } from "next/dist/next-server/lib/utils";
import NextDataHooksContext from "./next-data-hooks-context";

/**
 * Higher order component that wraps an app in the Next Data Hook Context.
 */
function DataHooksApp(Comp: AppType | typeof App): AppType {
  const app = function(props: AppProps) {
    return <NextDataHooksContext.Provider value={props?.pageProps?.nextDataHooks}>
      <Comp {...props} />
    </NextDataHooksContext.Provider>
  }
  app.getInitialProps = Comp.getInitialProps;
  return app as any;
}

export default DataHooksApp;
