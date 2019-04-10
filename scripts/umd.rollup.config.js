/**
 * Rollup configuration for packaging the plugin in a module that is consumable
 * as the `src` of a `script` tag or via AMD or similar client-side loading.
 *
 * This module DOES include its dependencies.
 */
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';

export default {
  name: 'videojsHttpSourceSelector',
  input: 'src/plugin.js',
  output: {
    name: 'videojs-http-source-selector',
    file: 'dist/videojs-http-source-selector.js',
    format: 'umd'
  },
  external: [
    'global',
    'global/window',
    'global/document',
    'video.js'
  ],
  globals: {
    'video.js': 'videojs',
    'global': 'window',
    'global/window': 'window',
    'global/document': 'document'
  },
  plugins: [
    resolve({
      browser: true,
      main: true,
      jsnext: true
    }),
    json(),
    commonjs({
      sourceMap: false
    }),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          loose: true,
          modules: false
        }]
      ],
      plugins: [
        '@babel/external-helpers',
        '@babel/transform-object-assign'
      ]
    })
  ]
};
