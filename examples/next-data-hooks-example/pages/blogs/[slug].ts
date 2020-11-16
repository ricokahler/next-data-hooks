import { createDataHooksProps } from 'next-data-hooks';
import BlogPost, { useBlogPost } from 'routes/blogs/blog-post';
import getBlogPosts from 'helpers/get-blog-posts';

export const getStaticPaths = async () => {
  const blogPosts = await getBlogPosts();

  return {
    paths: blogPosts.map(({ slug }) => `/blogs/${slug}`),
    fallback: false,
  };
};
export const getStaticProps = createDataHooksProps([useBlogPost]);
export default BlogPost;
