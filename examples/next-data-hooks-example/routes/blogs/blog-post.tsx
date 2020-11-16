import Link from 'next/link';
import { createDataHook } from 'next-data-hooks';
import getBlogPosts from 'helpers/get-blog-posts';

export const useBlogPost = createDataHook('BlogPost', async (context) => {
  const slug = context.params?.slug as string;
  const blogPosts = await getBlogPosts();
  const blogPost = blogPosts.find((blogPost) => blogPost.slug === slug)!;
  return blogPost;
});

function BlogPost() {
  const { title, content } = useBlogPost();

  return (
    <>
      <Link href="/blogs">
        <a>← Other Posts</a>
      </Link>

      <h1>{title}</h1>
      <p>{content}</p>
    </>
  );
}

export default BlogPost;
