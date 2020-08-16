import React, { useEffect } from 'react';
import { act, create } from 'react-test-renderer';
import createHookFactory from './';

it('works', async () => {
  const { createDataHook, getStaticProps, withDataHooks } = createHookFactory(
    (context) => ({
      foo: 'bar',
      context,
    })
  );

  const useData = createDataHook('key', async ({ foo, context }) => {
    await new Promise((resolve) => setTimeout(resolve, 0));

    return {
      foo,
      context,
    };
  });

  const staticProps = await getStaticProps({
    params: { foo: 'bar' },
  });

  let data: any;

  function Page() {
    const thisData = useData();

    useEffect(() => {
      data = thisData;
    }, [thisData]);

    return null;
  }

  const Wrapped = withDataHooks(Page);

  act(() => {
    create(<Wrapped {...staticProps.props} />);
  });

  expect(data).toMatchInlineSnapshot(`
    Object {
      "context": Object {
        "params": Object {
          "foo": "bar",
        },
      },
      "foo": "bar",
    }
  `);
});

it('throw if calls are out of order', async () => {
  const {
    createDataHook,
    getStaticProps,
    withDataHooks,
  } = createHookFactory(() => ({}));

  const staticProps = await getStaticProps({
    params: { foo: 'bar' },
  });

  const useData = createDataHook('key', async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    return {};
  });

  function Page() {
    useData();
    return null;
  }

  let error!: Error;

  class ErrorBoundary extends React.Component<{}, { hadError: boolean }> {
    state = {
      hadError: false,
    };

    static getDerivedStateFromError(thisError) {
      error = thisError;
      return { hadError: true };
    }

    render() {
      if (this.state.hadError) {
        return null;
      }

      return this.props.children;
    }
  }

  const Wrapped = withDataHooks(Page);

  act(() => {
    create(
      <ErrorBoundary>
        <Wrapped {...staticProps.props} />
      </ErrorBoundary>
    );
  });

  expect(error).toMatchInlineSnapshot(
    `[Error: Could not data from context. TODO: add shortlink to docs]`
  );
});

it('throws if no context is found', async () => {
  const { createDataHook } = createHookFactory(() => ({}));

  const useData = createDataHook('key', async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    return {};
  });

  function Page() {
    useData();
    return null;
  }

  let error!: Error;

  class ErrorBoundary extends React.Component<{}, { hadError: boolean }> {
    state = {
      hadError: false,
    };

    static getDerivedStateFromError(thisError) {
      error = thisError;
      return { hadError: true };
    }

    render() {
      if (this.state.hadError) {
        return null;
      }

      return this.props.children;
    }
  }

  act(() => {
    create(
      <ErrorBoundary>
        <Page />
      </ErrorBoundary>
    );
  });

  expect(error).toMatchInlineSnapshot(
    `[Error: Could not find next-data-hooks context. TODO: add shortlink to docs]`
  );
});

it('throws if there is a duplicate key', async () => {
  const { createDataHook } = createHookFactory(() => ({}));

  createDataHook('key', async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    return {};
  });

  try {
    createDataHook('key', async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      return {};
    });
  } catch (e) {
    expect(e).toMatchInlineSnapshot(
      `[Error: You already have data hook registered with key "key". TODO: add shortlink to docs]`
    );
  }
});
