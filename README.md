# next-data-hooks

> Co-located, static data hooks in next.js

> **Disclaimer:** ⚠️ Not stable yet

## Why?

Writing one large query per page doesn't organize well. Asynchronous data fetching frameworks like apollo, relay, and react-query already allow you to write the queries closer to the component, why can't static query be written closer to the component too?

`next-data-hooks` is a small lib that lets you write React hooks for static data queries in next.js

## Installation

```
npm i next-data-hooks
```

```
yarn add next-data-hooks
```

## Usage

1. Create the "hook factory" file.

For each page, you create a hook factory where you can define a set of variables to be shared with every hook created from this particular factory.

```js
// /routes/about/data-hooks.js
// NOTE: This file _must_ be separated.
import createHookFactory from 'next-data-hooks';

export const {
  createDataHook,
  getStaticProps,
  withDataHooks,
} = createHookFactory(
  // This is the same context from `getStaticProps`.
  // In this function, take the context and return an object that every data
  // hook from this factory will use.
  (context) => {
    const { id } = context.params;
    return { id };
  }
);
```

2. Import the hook factory in the page you're creating the data hooks for.

```js
// /pages/about.js
import { withDataHooks, getStaticProps } from 'routes/about/data-hooks';
import ExampleAboutComponent from 'routes/about/example-about-component';

function AboutPage() {
  return (
    <div>
      <h1>About</h1>
      <ExampleAboutComponent />
    </div>
  );
}

export { getStaticProps };
export default withDataHooks(AboutPage);
```

3. Define the data hooks. Co-locate them in components or put them anywhere else you'd like.

```js
// /routes/about/example-about-component
import React from 'react';
import { createDataHook } from 'routes/about/data-hooks';

// Provide `createDataHook` an async function and the hook will return that
// data like it was synchronous (because it was pull during build time).
const useExampleData = createDataHook(
  // These params are what you return in the function provided to `createHookFactory`.
  async ({ id }) => {
    const response = await fetch(`/api/examples/${id}`);
    const data = await response.json();
    return data;
  }
);

function ExampleAboutComponent() {
  // this data is readily available when you call the hook
  const exampleData = useExampleData();

  return (
    <div>
      <h2>Example Component</h2>
      <div>{exampleData.name}</div>
    </div>
  );
}

export default ExampleAboutComponent;
```

> ⚠️ **Important Note** ⚠️
>
> Next.js cannot remove the code inside of `createDataHook` because it's written outside of `getStaticProps`. If you use data hooks, be aware of the bundle size of the modules you import. [See here](https://nextjs.org/docs/basic-features/data-fetching#write-server-side-code-directly) for more info.
