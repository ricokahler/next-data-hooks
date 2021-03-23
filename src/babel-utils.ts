import { GetServerSidePropsContext, GetStaticPropsContext } from "next";
import getDataHooksProps from "./get-data-hooks-props";
import createDataHook from "./create-data-hook";
import useData from "./use-data";

type DataHook = ReturnType<typeof createDataHook>;

/** Builds an array of getData functions off of useData hooks and .dataHooks arrays. */
export function createDataHooksArray(...items: any[]): DataHook[] | undefined {
  const arr = items.map((item) => item && (item.getData ? item : item.dataHooks)).filter(Boolean);
  return arr.length > 0 ? arr : undefined;
}

export function injectNextDataFetcher(dataHooks: DataHook[], exports: any) {
  if (!dataHooks || dataHooks.length === 0) {
    return;
  }

  const isServerSide = dataHooks.some(x => x.server);
  const impliedDataFetcher = isServerSide ? 'getServerSideProps' : 'getStaticProps';

  exports[impliedDataFetcher] = async (context: GetStaticPropsContext | GetServerSidePropsContext) => {
    return {
      props: await getDataHooksProps({
        context,
        dataHooks,
      }),
    };
  };
}

export function wrapNextDataFetcher() {

}

export function createClientDataHook(key: string) {
  return useData.bind(null, key);
}
