import React, { useEffect } from 'react';
import { create, act } from 'react-test-renderer';
import createDataHook from './create-data-hook';
import createDataHooksProps from './create-data-hooks-props';
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

  const getStaticProps = createDataHooksProps([useData]);
  const { props } = await getStaticProps({ params: { hello: 'world' } });

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
