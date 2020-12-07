import exec from '@ricokahler/exec';

jest.setTimeout(3 * 60 * 1000);

const conditionalIt = process.env.CI ? it : it.skip;

conditionalIt(
  'builds the app and removes dead code via the babel plugin',
  async () => {
    await exec('rm -rf test-app');
    await exec('npm run build -- --no-tests');
    await exec(
      // TODO: make this pull from the current branch instead of from `main`
      'create-next-app test-app --example https://github.com/ricokahler/next-data-hooks --example-path examples/next-data-hooks-example -y'
    );
    await exec('yarn --cwd ./test-app add ../dist');
    await exec('yarn --cwd ./test-app build');
    await exec('yarn --cwd ./test-app export');

    try {
      await exec('grep -r ./test-app/out -e get-blog-posts-side-effect -q');
    } catch {
      // we expect grep to throw because it shouldn't find that code
    }

    // a control: we do expect grep to find something here
    await exec('grep -r ./test-app/out -e lorem -q');
  }
);
