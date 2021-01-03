import { GetServerSidePropsContext, GetStaticPropsContext } from 'next';

function isServerSidePropsContext(
  context: GetServerSidePropsContext | GetStaticPropsContext
): context is GetServerSidePropsContext {
  if (typeof context !== 'object' || !context) return false;

  return (
    !!(context as GetServerSidePropsContext).req &&
    !!(context as GetServerSidePropsContext).res
  );
}

export default isServerSidePropsContext;
