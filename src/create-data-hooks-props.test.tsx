import { GetStaticPropsContext } from 'next';
import createDataHooksProps from './create-data-hooks-props';
import createDataHook from './create-data-hook';

it('returns a getStaticProps function that pulls and populates props', async () => {
  const useFoo = createDataHook('Foo', async (context) => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    return { foo: 'foo', context };
  });

  const useBar = createDataHook('Bar', async (context) => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    return { bar: 'bar', context };
  });

  const getStaticProps = createDataHooksProps([useFoo, useBar]);
  const mockContext: GetStaticPropsContext = { params: { mock: 'context' } };

  const result = await getStaticProps(mockContext);

  expect(result).toMatchInlineSnapshot(`
    Object {
      "props": Object {
        "__dataHooksContextValue": Object {
          "Bar": Object {
            "bar": "bar",
            "context": Object {
              "params": Object {
                "mock": "context",
              },
            },
          },
          "Foo": Object {
            "context": Object {
              "params": Object {
                "mock": "context",
              },
            },
            "foo": "foo",
          },
        },
      },
    }
  `);
});

it('throws if it encounters two data hooks with the same key', async () => {
  const useFoo = createDataHook('Hook', () => null);
  const useBar = createDataHook('Hook', () => null);

  expect(() =>
    createDataHooksProps([useFoo, useBar])
  ).toThrowErrorMatchingInlineSnapshot(
    `"Found duplicate hook key \\"Hook\\". Ensure all hook keys per \`createDatHooksProps\` call are unique."`
  );
});

it('throws if it the stub function is run', async () => {
  // @ts-ignore
  const useFoo = createDataHook('Foo');
  const getStaticProps = createDataHooksProps([useFoo]);

  let caught = false;
  try {
    await getStaticProps({});
  } catch (e) {
    caught = true;
    expect(e).toMatchInlineSnapshot(
      `[Error: Create data hook was run in the browser. TODO ADD LINK]`
    );
  }
  expect(caught).toBe(true);
});
