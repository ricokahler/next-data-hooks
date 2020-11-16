# next-data-hooks · [![codecov](https://codecov.io/gh/ricokahler/next-data-hooks/branch/main/graph/badge.svg)](https://codecov.io/gh/ricokahler/next-data-hooks) [![github status checks](https://badgen.net/github/checks/ricokahler/next-data-hooks/main)](https://github.com/ricokahler/next-data-hooks/actions) [![bundlephobia](https://badgen.net/bundlephobia/minzip/next-data-hooks)](https://bundlephobia.com/result?p=next-data-hooks)

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

> ⚠️ Don't forget this step. This enables **code elimination** to eliminate server-side code in client code.

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

<!-- DOCSTART -->

### `createDataHook(key, getData)`

Creates a data hook.

**Params**

| Name      | Type                                                    | Description                                                               |
| --------- | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| `key`     | `string`                                                | The key to uniquely identify this data hooks from other on the same page. |
| `getData` | `(variables: GetStaticPropsContext) => R \| Promise<R>` | An async for data that will be called via `getStaticProps` in next.js     |

**Return**

A hook that can be used in any component within the page's React tree

```
(() => Unwrap<R>) & { getData: (variables: GetStaticPropsContext) => R | Promise<R>; key: string; }
```

### `createDataHooksProps(hooks)`

Given an array of data hooks created with `createDataHooks`, this function
returns a function that be used as a `getStaticProps` implementation.

**Params**

| Name    | Type         | Description                                           |
| ------- | ------------ | ----------------------------------------------------- |
| `hooks` | `DataHook[]` | an array of data hooks created with `createDataHooks` |

**Return**

a `getStaticProps` implementation

```
(context: GetStaticPropsContext) => Promise<{ props: { nextDataHooks: any; }; }>
```

### `NextDataHooksProvider(nextDataHooks)`

Injects the data from data hooks into React Context. Place this in `_app`

**Params**

| Name            | Type  | Description |
| --------------- | ----- | ----------- |
| `nextDataHooks` | `any` |             |

**Return**

```
JSX.Element
```

<!-- DOCEND -->
