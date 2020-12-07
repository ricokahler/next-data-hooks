import React, { useEffect } from 'react';
import { GetStaticPropsContext } from 'next';
import { create, act } from 'react-test-renderer';
import createDataHook from './create-data-hook';
import getDataHooksProps from './get-data-hooks-props';
import NextDataHooksProvider from './next-data-hooks-provider';

it('Injects the data from data hooks into React Context.', async () => {
  const useData = createDataHook('DataKey', () => ({ hello: 'world' }));
  const dataHandler = jest.fn();

  function Foo() {
    const data = useData();

    useEffect(() => {
      dataHandler(data);
    }, [data]);

    return null;
  }

  const mockContext: GetStaticPropsContext = { params: { mock: 'context' } };
  const props = await getDataHooksProps({
    context: mockContext,
    hooks: [useData],
  });

  act(() => {
    create(
      <NextDataHooksProvider {...props}>
        <Foo />
      </NextDataHooksProvider>
    );
  });

  expect(dataHandler).toMatchInlineSnapshot(`
    [MockFunction] {
      "calls": Array [
        Array [
          Object {
            "hello": "world",
          },
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
