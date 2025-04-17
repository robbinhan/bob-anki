const path = require('path');
const copy = require('rollup-plugin-copy');
const json = require('@rollup/plugin-json');
// const babel = require('@rollup/plugin-babel').default; // 注意：@rollup/plugin-babel 可能需要 .default
const esbuild = require('rollup-plugin-esbuild').default; // 尝试添加 .default
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const packageJson = require('./package.json'); // require 可以直接加载 JSON
const typescript = require("@rollup/plugin-typescript");

const pkg = `${packageJson.name}.bobplugin`;

module.exports = {
  input: path.join(__dirname, './src/main.ts'),
  output: {
    format: 'cjs',
    exports: 'auto',
    file: path.join(__dirname, `./dist/${pkg}/main.js`),
    globals: {
      $util: '$util',
      $http: '$http',
      $info: '$info',
      $option: '$option',
      $log: '$log',
      $data: '$data',
      $file: '$file',
    }
  },
  plugins: [
    copy({
      targets: [
        { src: './src/info.json', dest: `dist/${pkg}/` },
        { src: './src/libs', dest: `dist/${pkg}/` },
      ],
    }),
    typescript({
      tsconfig: './tsconfig.json', // 指定 tsconfig 文件
      // 可能需要显式指定依赖 tslib
      // tslib: require.resolve('tslib') // 通常不需要，但可以尝试
    }),
    json({ namedExports: false }),
    resolve({
      extensions: ['.js', '.ts', '.json'],
      preferBuiltins: false,
    }),
    commonjs(),
    nodePolyfills(),
    // babel({
    //   extensions: ['.js', '.ts'],
    //   babelHelpers: 'bundled',
    //   exclude: 'node_modules/**',
    // }),
    esbuild({
      // All options are optional
      include: /\.[jt]?s$/, // default, inferred from `loaders` option
      exclude: /node_modules/, // default
      sourceMap: true, // default
      minify: process.env.NODE_ENV === 'production',
      target: 'es2018', // default, or 'es20XX', 'esnext',
      // Add extra loaders
      loaders: {
        // Add .json files support
        // require @rollup/plugin-commonjs
        '.json': 'json',
      },
    }),
  ],
  external: ['crypto-js']
};