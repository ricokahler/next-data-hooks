# next-data-hooks · [![codecov](https://codecov.io/gh/ricokahler/next-data-hooks/branch/master/graph/badge.svg)](https://codecov.io/gh/ricokahler/next-data-hooks) [![github status checks](https://badgen.net/github/checks/ricokahler/next-data-hooks)](https://github.com/ricokahler/next-data-hooks/actions) [![bundlephobia](https://badgen.net/bundlephobia/minzip/next-data-hooks)](https://bundlephobia.com/result?p=next-data-hooks)

> Co-located, static data hooks in next.js

## Why?

Writing one large query per page doesn't organize well. Asynchronous data fetching frameworks like apollo, relay, and react-query already allow you to write the queries closer to the component.

Why can't static data queries be written closer to the component too?

`next-data-hooks` is a small and simple lib that lets you write React hooks for static data queries in next.js by lifting static props to React Context.

## Installation

1. Install

```
npm i next-data-hooks
```

or

```
yarn add next-data-hooks
```

2. Add Provider to `_app`

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

This enables code elimination to eliminate server-side code on the client.

## Usage

1. Create a data hook. This can be in the same file as the component you're using it in or elsewhere.

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

2. Create data hooks props at the page entry point. Import all data hooks.

```tsx
import { createDataHooksProps } from 'next-data-hooks';
import { GetStaticPaths } from 'next';
import { useBlogPost } from '..';
import BlogPostComponent from '..';

export const getStaticPaths: GetStaticPaths = (context) => {
  // return static paths...
};
export const getStaticProps = createDataHooksProps([useBlogPost]);

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

## API

## Recommended patterns and folder structures

## Code elimination

The nice thing about
