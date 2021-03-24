import { GetServerSideProps, GetServerSidePropsContext, GetStaticProps } from "next";
import createDataHook from "./create-data-hook";
import getDataHooksProps from "./get-data-hooks-props";
import useData from "./use-data";

type DataHook = ReturnType<typeof createDataHook>;

/** Builds an array of getData functions off of useData hooks and .dataHooks arrays. */
export function createDataHooksArray(...items: any[]): DataHook[] | undefined {
  const arr = [].concat(...items.map((item) => item && (item.getData ? item : item.dataHooks)).filter(Boolean));
  return arr.length > 0 ? arr : undefined;
}

export function createClientDataHook(key: string) {
  return useData.bind(null, key);
}

export function createGetStaticProps<T extends GetStaticProps | GetServerSideProps>(dataHooks: DataHook[], gsp?: T): T | undefined {
  if (!dataHooks) return gsp;

  if (gsp) {
    return async function(context: GetServerSidePropsContext) {
      const [ mainFetcher, dataHookProps ]: [ any, any ] = await Promise.all([
        gsp(context),
        getDataHooksProps({ context, dataHooks })
      ]);

      return {
        ...mainFetcher,
        props: {
          ...mainFetcher.props,
          ...dataHookProps
        }
      };
    } as any
  } else {
    // generic
    return async function(context: GetServerSidePropsContext) {
      return {
        props: await getDataHooksProps({ context, dataHooks })
      };
    } as any
  }
}
