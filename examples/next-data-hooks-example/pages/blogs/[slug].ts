import { getDataHooksProps } from 'next-data-hooks';
import { GetStaticProps } from 'next';
import BlogPost, { useBlogPost } from 'routes/blogs/blog-post';
import getBlogPosts from 'helpers/get-blog-posts';

export const getStaticPaths = async () => {
  const blogPosts = await getBlogPosts();

  return {
    paths: blogPosts.map(({ slug }) => `/blogs/${slug}`),
    fallback: false,
  };
};
export const getStaticProps: GetStaticProps = async (context) => {
  const dataHooksProps = await getDataHooksProps({
    context,
    hooks: [useBlogPost],
  });

  return {
    props: { ...dataHooksProps },
  };
};

export default BlogPost;
