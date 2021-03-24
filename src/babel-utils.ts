import createDataHook from "./create-data-hook";
import useData from "./use-data";

type DataHook = ReturnType<typeof createDataHook>;

/** Builds an array of getData functions off of useData hooks and .dataHooks arrays. */
export function createDataHooksArray(...items: any[]): DataHook[] | undefined {
  const arr = items.map((item) => item && (item.getData ? item : item.dataHooks)).filter(Boolean);
  return arr.length > 0 ? arr : undefined;
}

export function createClientDataHook(key: string) {
  return useData.bind(null, key);
}
