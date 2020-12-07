# next-data-hooks · [![codecov](https://codecov.io/gh/ricokahler/next-data-hooks/branch/main/graph/badge.svg)](https://codecov.io/gh/ricokahler/next-data-hooks) [![github status checks](https://badgen.net/github/checks/ricokahler/next-data-hooks/main)](https://github.com/ricokahler/next-data-hooks/actions) [![bundlephobia](https://badgen.net/bundlephobia/minzip/next-data-hooks)](https://bundlephobia.com/result?p=next-data-hooks)

> Use `getStaticProps` as react hooks

## Why?

Writing one large query per page doesn't organize well. Asynchronous data fetching frameworks like apollo, relay, and react-query already allow you to write the queries closer to the component.

Why can't static data queries be written closer to the component too?

`next-data-hooks` is a small and simple lib that lets you write React hooks for static data queries in next.js by lifting static props into React Context.

## Example

See [the example in this repo](https://github.com/ricokahler/next-data-hooks/tree/main/examples/next-data-hooks-example) for some ideas on how to organize your static data call using this hook.

## Installation

1. Install

```
npm i next-data-hooks
```

or

```
yarn add next-data-hooks
```

2. Add Provider to `_app.tsx` or `_app.js`

```tsx
import { AppProps } from 'next/app';
import { NextDataHooksProvider } from 'next-data-hooks';

function App({ Component, pageProps }: AppProps) {
  const { children, ...rest } = pageProps;

  return (
    <NextDataHooksProvider {...rest}>
      <Component {...rest}>{children}</Component>
    </NextDataHooksProvider>
  );
}
```

3. Add the babel plugin

At the root, add a `.babelrc` file that contains the following:

```json
{
  "presets": ["next/babel"],
  "plugins": ["next-data-hooks/babel"]
}
```

> ⚠️ Don't forget this step. This enables [**code elimination**](#code-elimination) to eliminate server-side code in client code.

## Usage

1. Create a data hook. This can be in the same file as the component you're using it in or anywhere else.

```tsx
import { createDataHook } from 'next-data-hooks';

// this context is the GetStaticPropsContext from 'next'
//                                                             👇
export const useBlogPost = createDataHook('BlogPost', async (context) => {
  const slug = context.params?.slug as string;

  // do something async to grab the data your component needs
  const blogPost = /* ... */;

  return blogPost;
});
```

2. Get the data hooks props and pass it down in `getStaticProps`. Import all data hooks.

```tsx
import { getDataHooksProps } from 'next-data-hooks';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useBlogPost } from '..';
import BlogPostComponent from '..';

export const getStaticPaths: GetStaticPaths = async (context) => {
  // return static paths...
};

export const getStaticProps: GetStaticProps = async (context) => {
  const dataHooksProps = await getDataHooksProps({
    context,
    // you can add more than one here
    //         👇👇👇
    hooks: [useBlogPost],
  });

  return {
    props: {
      // spread the props required by next-data-hooks
      ...dataHooksProps,
    },
  };
};

export default function BlogPostEntry() {
  return (
    <>
      {/* Note: this component doesn't have to be a direct child of BlogPostEntry */}
      <BlogPostComponent />
    </>
  );
}
```

3. Use the data hook in any component under that page.

```tsx
import { useBlogPost } from '..';

function BlogPostComponent() {
  const { title, content } = useBlogPost();

  return (
    <article>
      <h1>{title}</h1>
      <p>{content}</p>
    </article>
  );
}
```

## Useful Patterns

### A separate `routes` directory

Next.js has a very opinionated file-based routing mechanism that doesn't allow you to put a file in the `/pages` folder without it being considered a page.

Simply put, this doesn't allow for much organization.

With `next-data-hooks`, you can treat the `/pages` folder as a folder of entry points and organize files elsewhere.

```
my-project
# think of the pages folder as entry points to your routes
├── pages
│   ├── blog
│   │   ├── [slug].ts
│   │   └── index.ts
│   └── shop
│       ├── category
│       │   └── [slug].ts
│       ├── index.ts
│       └── product
│           └── [slug].ts
|
# think of each route folder as its own app with it's own components and helpers
└── routes
    ├── blog
    │   ├── components
    │   │   ├── blog-index.tsx
    │   │   ├── blog-post-card.tsx
    │   │   └── blog-post.tsx
    │   └── helpers
    │       └── example-blog-helper.ts
    └── shop
        ├── components
        │   ├── category.tsx
        │   ├── product-description.tsx
        │   └── product.tsx
        └── helpers
            └── example-shop-helper.ts
```

#### `/routes/blog/components/blog-post.tsx`

```tsx
import { createDataHook } from 'next-data-hooks';

// write your data hook in a co-located place
export const useBlogPostData = createDataHook('BlogPost', async (context) => {
  const blogPostData = // get blog post data…
  return blogPostData;
});

function BlogPost() {
  // use it in the component
  const { title, content } = useBlogPostData();

  return (
    <article>
      <h1>{title}</h1>
      <p>{content}</p>
    </article>
  );
}

export default BlogPost;
```

#### `/pages/blog/[slug].ts`

```ts
import { GetStaticProps, GetStaticPaths } from 'next';
import { getDataHooksProps } from 'next-data-hooks';
import BlogPost, { useBlogPost } from 'routes/blog/components/blog-post';

export const getStaticPaths: GetStaticPaths = {}; /* ... */

export const getStaticProps: GetStaticProps = async (context) => {
  const dataHooksProps = getDataHooksProps({ context, hooks: [useBlogPost] });
  return { props: dataHooksProps };
};

// re-export your component. this file is just an entry point
export default BlogPost;
```

> **👋 Note:** the above is just an example of how you can use `next-data-hooks` to organize your project. The main takeaway is that you can re-export page components to change the structure and `next-data-hooks` works well with this pattern.

### Co-located queries

This pattern can be particularly useful if you're writing a component that requires dynamic data but you don't want to worry about how that data gets to your component.

For example, let's say you have a `Header` component that's nested in a `Layout` component.

With `next-data-hooks`, you write the query closer to the component.

#### `header.tsx`

```tsx
import { createDataHook } from 'next-data-hooks';

// Write a query closer to the component
export const useHeaderData = createDataHook('Header', async (context) => {
  // pull header data...
});

function Header() {
  const headerData = useHeaderData();

  return <>{/* use `headerData` */}</>;
}

export default Header;
```

#### `layout.tsx`

Then you can use the component anywhere else in your component tree. Note how this component is unaware of the header data.

```tsx
import Header from './header';

interface Props {
  // ...
}

function Layout({ children }: Props) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}

export default Layout;
```

#### `my-page.tsx`

Finally, wire-up the hooks in one place.

```tsx
// my-page.tsx
import { GetStaticProps } from 'next';
import { useHeaderData } from 'components/header';
import MyPage from 'routes/my-page';

export const getStaticProps: GetStaticProps = async (context) => {
  const dataHooksProps = await getDataHooksProps({
    context,
    // include it once here and it'll wire up the data hook wherever it's used
    hooks: [useHeaderData],
  });

  return {
    props: { ...dataHooksProps },
  };
};

export default MyPage;
```

## Code elimination

For smaller bundles, Next.js eliminates code that is only intended to run inside `getStaticProps`.

`next-data-hooks` does the same by a babel plugin that prefixes your data hook definition with `typeof window !== 'undefined' ? <stub> : <real data hook>`.

This works because [Next.js pre-evaluates the expression `typeof window` to `'object'` in browsers.](https://github.com/vercel/next.js/issues/5354#issuecomment-650170660) This will make the above ternary always evaluate to the `<stub>` in the browser. Terser then shakes away the `<real data hook>` expression eliminating it from the browser bundle.

If you saw the error `Create data hook was run in the browser.` then something may have went wrong with the code elimination. Please open an issue.

> **👋 Note**. There may be differences in Next.js's default code elimination and `next-data-hooks` code elimination. Double check your bundle.
