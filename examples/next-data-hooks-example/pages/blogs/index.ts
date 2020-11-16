import { createDataHooksProps } from 'next-data-hooks';
import BlogPostIndex, { useBlogPostIndex } from 'routes/blogs/index';

export const getStaticProps = createDataHooksProps([useBlogPostIndex]);
export default BlogPostIndex;
