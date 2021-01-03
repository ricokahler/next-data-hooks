import isServerSidePropsContext from './is-server-side-props-context';

it('returns true if there is a req and res', () => {
  expect(isServerSidePropsContext({ req: true, res: true } as any)).toBe(true);
  expect(isServerSidePropsContext({} as any)).toBe(false);
});
