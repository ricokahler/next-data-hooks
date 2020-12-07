import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const extensions = ['.js', '.ts', '.tsx'];
const external = [/^@babel\/runtime/, 'react', 'next'];

export default [
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.js',
      format: 'umd',
      sourcemap: true,
      name: 'NextDataHooks',
      globals: {
        react: 'React',
      },
    },
    plugins: [
      resolve({
        extensions,
      }),
      babel({
        babelrc: false,
        presets: [
          ['@babel/preset-env', { targets: { node: true } }],
          '@babel/preset-typescript',
          ['@babel/preset-react'],
        ],
        babelHelpers: 'bundled',
        extensions,
      }),
    ],
    external,
  },
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      resolve({
        extensions,
        modulesOnly: true,
      }),
      babel({
        babelrc: false,
        presets: [
          ['@babel/preset-env', { targets: 'node 10 and not IE 11' }],
          '@babel/preset-typescript',
          '@babel/preset-react',
        ],
        plugins: ['@babel/plugin-transform-runtime'],
        babelHelpers: 'runtime',
        extensions,
      }),
    ],
    external,
  },
  {
    input: './src/babel.ts',
    output: {
      file: './dist/babel.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
    },
    external: ['@babel/core'],
    plugins: [
      resolve({
        extensions,
        modulesOnly: true,
      }),
      babel({
        babelrc: false,
        presets: [
          '@babel/preset-typescript',
          ['@babel/preset-env', { targets: { node: true } }],
        ],
        babelHelpers: 'bundled',
        extensions,
      }),
    ],
  },
];
