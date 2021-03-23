import BlogPost from 'routes/blogs/blog-post';
import getBlogPosts from 'helpers/get-blog-posts';

export const getStaticPaths = async () => {
  const blogPosts = await getBlogPosts();

  return {
    paths: blogPosts.map(({ slug }) => `/blogs/${slug}`),
    fallback: false,
  };
};

export default BlogPost;

// FIXME: this is required to trigger something in webpack
module.exports;
