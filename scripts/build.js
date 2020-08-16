const exec = require('@ricokahler/exec');
const fs = require('fs');
const path = require('path');
const { hashElement } = require('folder-hash');
const packageJson = require('../package.json');

const args = process.argv.slice(2);

async function build() {
  console.log('Cleaning…');
  await exec('npm run clean');

  console.log('Installing…');
  await exec('npm i');

  console.log('Testing…');
  await exec('npm t');

  console.log('Linting…');
  await exec('npm run lint');

  console.log('Compiling types…');
  await exec('npm run types');

  console.log('Rolling…');
  await exec('npx rollup -c');

  const { hash } = await hashElement(path.resolve(__dirname, '../dist'), {
    encoding: 'hex',
  });

  console.log('Writing package.json…');
  const {
    devDependencies,
    scripts,
    private: _private,
    version,
    ...restOfPackageJson
  } = packageJson;
  await fs.promises.writeFile(
    './dist/package.json',
    JSON.stringify(
      {
        ...restOfPackageJson,
        version: args.includes('--use-package-version')
          ? version
          : `0.0.0-${hash.substring(0, 9)}`,
        main: 'index.js',
        module: 'index.esm.js',
      },
      null,
      2
    )
  );
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
