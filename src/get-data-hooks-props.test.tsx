import { GetStaticPropsContext } from 'next';
import getDataHooksProps from './get-data-hooks-props';
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

  const mockContext: GetStaticPropsContext = { params: { mock: 'context' } };

  const result = await getDataHooksProps({
    context: mockContext,
    dataHooks: [useFoo, useBar],
  });

  expect(result).toMatchInlineSnapshot(`
    Object {
      "nextDataHooks": Object {
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
    }
  `);
});

it('throws if it encounters two data hooks with the same key', async () => {
  const useFoo = createDataHook('Hook', () => null);
  const useBar = createDataHook('Hook', () => null);

  const mockContext: GetStaticPropsContext = { params: { mock: 'context' } };
  let caught = false;

  try {
    await getDataHooksProps({
      context: mockContext,
      dataHooks: [useFoo, useBar],
    });
  } catch (e) {
    expect(e).toMatchInlineSnapshot(
      `[Error: Found duplicate hook key "Hook". Ensure all hook keys per \`createDataHooksProps\` call are unique.]`
    );
    caught = true;
  }

  expect(caught).toBe(true);
});

it('throws if it the stub function is run', async () => {
  // @ts-ignore
  const useFoo = createDataHook('Foo');
  const mockContext: GetStaticPropsContext = { params: { mock: 'context' } };

  let caught = false;
  try {
    await getDataHooksProps({
      context: mockContext,
      dataHooks: [useFoo],
    });
  } catch (e) {
    caught = true;
    expect(e).toMatchInlineSnapshot(
      `[Error: Create data hook was run in the browser. See https://github.com/ricokahler/next-data-hooks#code-elimination]`
    );
  }
  expect(caught).toBe(true);
});
