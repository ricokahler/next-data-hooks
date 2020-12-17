import React, { useEffect } from 'react';
import { create, act } from 'react-test-renderer';
import { ErrorBoundary } from 'react-error-boundary';
import createDataHook from './create-data-hook';
import NextDataHooksContext from './next-data-hooks-context';

// https://github.com/facebook/react/issues/11098#issuecomment-523977830
let spy;

beforeEach(() => {
  spy = jest.spyOn(console, 'error');
  spy.mockImplementation(() => {});
});

afterEach(() => {
  spy.mockRestore();
});

it('returns a hook that pulls from the given key', () => {
  const useData = createDataHook('DataKey', () => null);
  const dataHandler = jest.fn();

  function Foo() {
    const data = useData();

    useEffect(() => {
      dataHandler(data);
    }, [data]);

    return null;
  }

  act(() => {
    create(
      <NextDataHooksContext.Provider value={{ DataKey: 'foo' }}>
        <Foo />
      </NextDataHooksContext.Provider>
    );
  });

  expect(dataHandler).toMatchInlineSnapshot(`
    [MockFunction] {
      "calls": Array [
        Array [
          "foo",
        ],
      ],
      "results": Array [
        Object {
          "type": "return",
          "value": undefined,
        },
      ],
    }
  `);
});

it('throws if the context not be found', () => {
  const useData = createDataHook('DataKey', async () => null);
  const handleError = jest.fn();

  function Foo() {
    useData();

    return null;
  }

  act(() => {
    create(
      <ErrorBoundary fallback={<></>} onError={handleError}>
        <Foo />
      </ErrorBoundary>
    );
  });

  expect(handleError).toHaveBeenCalled();
  const error = handleError.mock.calls[0][0];
  expect(error.message).toMatchInlineSnapshot(
    `"Could not find \`NextDataHooksContext\`. Ensure \`NextDataHooksProvider\` is configured correctly."`
  );
});

it('throws if a data hook could not be found', () => {
  const useData = createDataHook('DataKey', () => null);
  const handleError = jest.fn();

  function Foo() {
    useData();

    return null;
  }

  act(() => {
    create(
      <ErrorBoundary fallback={<></>} onError={handleError}>
        <NextDataHooksContext.Provider value={{}}>
          <Foo />
        </NextDataHooksContext.Provider>
      </ErrorBoundary>
    );
  });

  expect(handleError).toHaveBeenCalled();
  const error = handleError.mock.calls[0][0];
  expect(error).toMatchInlineSnapshot(
    `[Error: Did not find a data hook named "DataKey". Ensure it was provided to getDataHooksProps.]`
  );
});
