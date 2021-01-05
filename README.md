# next-data-hooks · [![codecov](https://codecov.io/gh/ricokahler/next-data-hooks/branch/main/graph/badge.svg)](https://codecov.io/gh/ricokahler/next-data-hooks) [![github status checks](https://badgen.net/github/checks/ricokahler/next-data-hooks/main)](https://github.com/ricokahler/next-data-hooks/actions) [![bundlephobia](https://badgen.net/bundlephobia/minzip/next-data-hooks)](https://bundlephobia.com/result?p=next-data-hooks)

> Use `getStaticProps` and `getServerSideProps` as react hooks

`next-data-hooks` is a small and simple lib that lets you write React hooks for data queries in Next.js by lifting static props into React Context.

```js
import { createDataHook } from 'next-data-hooks';

const useBlogPost = createDataHook('BlogPost', async (context) => {
  const { slug } = context.params;

  return; // ... get the blog post
});

function BlogPost() {
  const { title, content } = useBlogPost();

  return (
    <>
      <h1>{title}</h1>
      <p>{content}</p>
    </>
  );
}

BlogPost.dataHooks = [useBlogPost];

export default BlogPost;
```

## Why?

1. Writing one large query per page doesn't organize well. Asynchronous data fetching frameworks like apollo, relay, and react-query already allow you to write the queries closer to the component. Why can't static data queries be written closer to the component too?
2. Works better with TypeScript — when you import a data hook, you're also importing its return type. When you call the hook inside your component, the types are already there.

## Example

See [the example in this repo](https://github.com/ricokahler/next-data-hooks/tree/main/examples/next-data-hooks-example) for some ideas on how to organize your static data calls using this hook.

## Installation

1. Install

```
npm i next-data-hooks
```

or

```
yarn add next-data-hooks
```

2. Add the babel plugin

At the root, add a `.babelrc` file that contains the following:

```json
{
  "presets": ["next/babel"],
  "plugins": ["next-data-hooks/babel"]
}
```

> ⚠️ Don't forget this step. This enables [**code elimination**](#code-elimination) to eliminate server-side code in client code.

3. Add the provider to `_app.tsx` or `_app.js`

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

## Usage

1. Create a data hook. This can be in the same file as the component you're using it in or anywhere else.

```tsx
import { createDataHook } from 'next-data-hooks';

// this context is the GetStaticPropsContext from 'next'
//                                                      👇
const useBlogPost = createDataHook('BlogPost', async (context) => {
  const slug = context.params?.slug as string;

  // do something async to grab the data your component needs
  const blogPost = /* ... */;

  return blogPost;
});

export default useBlogPost;
```

<details>
<summary>
TypeScript User?

> Note: For TypeScript users, if you're planning on only using the data hook in the context of `getServerSideProps`, you can import the provided [type guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards), `isServerSidePropsContext`, to narrow the type of the incoming context.

</summary>

```tsx
import { createDataHook, isServerSidePropsContext } from 'next-data-hooks';

const useServerSideData = createDataHook('Data', async (context) => {
  if (!isServerSidePropsContext(context)) {
    throw new Error('This data hook only works in getServerSideProps.');
  }

  // here, the type of `context` has been narrowed to the server side conext
  const query = context.req.query;
});

export default useServerSideData;
```

</details>

2. Use the data hook in a component. Add it to a static prop in an array with other data hooks to compose them downward.

```tsx
import ComponentThatUsesDataHooks from '..';
import useBlogPost from '..';
import useOtherDataHook from '..';

function BlogPostComponent() {
  const { title, content } = useBlogPost();
  const { other, data } = useOtherDataHook();

  return (
    <article>
      <h1>{title}</h1>
      <p>{content}</p>
      <p>
        {other} {data}
      </p>
    </article>
  );
}

// compose together other data hooks
BlogPostComponent.dataHooks = [
  ...ComponentThatUsesDataHooks.dataHooks,
  useOtherDataHooks,
  useBlogPost,
];

export default BlogPostComponent;
```

3. Pass the data hooks down in `getStaticProps` or `getServerSideProps`.

```tsx
import { getDataHooksProps } from 'next-data-hooks';
import { GetStaticPaths, GetStaticProps } from 'next';
import BlogPostComponent from '..';

export const getStaticPaths: GetStaticPaths = async (context) => {
  // return static paths...
};

// NOTE: this will also work with `getServerSideProps`
export const getStaticProps: GetStaticProps = async (context) => {
  const dataHooksProps = await getDataHooksProps({
    context,
    // this is an array of all data hooks from the `dataHooks` static prop.
    //                             👇👇👇
    dataHooks: BlogPostComponent.dataHooks,
  });

  return {
    props: {
      // spread the props required by next-data-hooks
      ...dataHooksProps,

      // add additional props to Next.js here
    },
  };
};

export default BlogPostComponent;
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
const useBlogPostData = createDataHook('BlogPost', async (context) => {
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

BlogPost.dataHooks = [useBlogPostData];

export default BlogPost;
```

#### `/pages/blog/[slug].ts`

```ts
import { GetStaticProps, GetStaticPaths } from 'next';
import { getDataHooksProps } from 'next-data-hooks';
import BlogPost from 'routes/blog/components/blog-post';

export const getStaticPaths: GetStaticPaths = {}; /* ... */

export const getStaticProps: GetStaticProps = async (context) => {
  const dataHooksProps = getDataHooksProps({
    context,
    dataHooks: BlogPost.dataHooks,
  });
  return { props: dataHooksProps };
};

// re-export your component. this file is just an entry point
export default BlogPost;
```

> **👋 Note:** the above is just an example of how you can use `next-data-hooks` to organize your project. The main takeaway is that you can re-export page components to change the structure and `next-data-hooks` works well with this pattern.

### Composing data hooks

Each data hook exposes a `getData` method which is simply the function you pass into `createDataHook`.

This can be used within other data hooks to pull the same data:

```tsx
import { createDataHook } from 'next-data-hooks';

const useHook = createDataHook('DataHook', async (context) => {
  return; // ...
});

export default useHook;
```

```tsx
import useHook from './';

const useOtherHook = createDataHook('Other', async (context) => {
  const data = await useHook.getData(context);

  // use data to do something…
});
```

> Note: Be aware that this method re-runs the function.

## Code elimination

For smaller bundles, Next.js eliminates code that is only intended to run inside `getStaticProps`.

`next-data-hooks` does the same by a babel plugin that prefixes your data hook definition with `typeof window !== 'undefined' ? <stub> : <real data hook>`.

This works because [Next.js pre-evaluates the expression `typeof window` to `'object'` in browsers.](https://github.com/vercel/next.js/issues/5354#issuecomment-650170660) This will make the above ternary always evaluate to the `<stub>` in the browser. Terser then shakes away the `<real data hook>` expression eliminating it from the browser bundle.

If you saw the error `Create data hook was run in the browser.` then something may have went wrong with the code elimination. Please open an issue.

> **👋 Note**. There may be differences in Next.js's default code elimination and `next-data-hooks` code elimination. Double check your bundle.
