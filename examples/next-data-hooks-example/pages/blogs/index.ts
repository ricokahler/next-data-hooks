import { GetStaticProps } from 'next';
import { getDataHooksProps } from 'next-data-hooks';
import BlogPostIndex from 'routes/blogs/index';

export const getStaticProps: GetStaticProps = async (context) => {
  const dataHooksProps = await getDataHooksProps({
    context,
    dataHooks: BlogPostIndex.dataHooks,
  });

  return {
    props: { ...dataHooksProps },
  };
};
export default BlogPostIndex;
