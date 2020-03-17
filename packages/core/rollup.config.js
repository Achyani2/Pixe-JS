import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';

export default [
    {
        input: 'lib/index.js',
        output: {
            format: 'umd',
            name: 'PUXI',
            file: 'bin/puxi-core.js',
            sourcemap: true,
            globals: {
                'pixi.js': 'PIXI',
                '@pixi/filter-drop-shadow': 'PIXI.filters',
            },
        },
        external: ['pixi.js', '@pixi/filter-drop-shadow'],
        plugins: [
            commonjs(),
            resolve(),
            builtins(),
        ],
    },
    {
        input: 'lib/index.js',
        output: {
            format: 'umd',
            name: 'PUXI',
            file: 'bin/puxi-core.min.js',
            sourcemap: true,
            globals: {
                'pixi.js': 'PIXI',
                '@pixi/filter-drop-shadow': 'PIXI.filters',
            },
        },
        external: ['pixi.js', '@pixi/filter-drop-shadow'],
        plugins: [
            terser(),
            commonjs(),
            resolve(),
            builtins(),
        ],
    },
];

