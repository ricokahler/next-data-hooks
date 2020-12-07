import { GetStaticProps } from 'next';
import { getDataHooksProps } from 'next-data-hooks';
import BlogPostIndex, { useBlogPostIndex } from 'routes/blogs/index';

export const getStaticProps: GetStaticProps = async (context) => {
  const dataHooksProps = await getDataHooksProps({
    context,
    hooks: [useBlogPostIndex],
  });

  return {
    props: { ...dataHooksProps },
  };
};
export default BlogPostIndex;
