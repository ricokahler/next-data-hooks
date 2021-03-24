import createDataHook from "./create-data-hook";

type DataHook = ReturnType<typeof createDataHook>;

/** Builds an array of getData functions off of useData hooks and .dataHooks arrays. */
function createDataHooksArray(...items: any[]): DataHook[] | undefined {
  const arr = [].concat(...items.map((item) => item && (item.getData ? item : item.dataHooks)).filter(Boolean));
  return arr.length > 0 ? arr : undefined;
}

export default createDataHooksArray;
