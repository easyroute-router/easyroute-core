import typescript from '@rollup/plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import cleaner from 'rollup-plugin-cleaner';

const es = {
    input: './lib/src/index.ts',
    plugins: [
        cleaner({
            targets: [
                './lib/dist'
            ]
        }),
        typescript({
            "declaration": true,
            "outDir": "./lib/dist"
        }),
        resolve({ extensions: ['.js', '.ts'] }),
        commonjs({ extensions: ['.js', '.ts'] })
    ],
    output: {
        dir: './lib/dist',
        format: 'es',
        name: 'easyroute'
    }
}

const iife = {
    input: './lib/src/index.ts',
    plugins: [
        typescript(),
        resolve({ extensions: ['.js', '.ts'] }),
        commonjs({ extensions: ['.js', '.ts'] })
    ],
    output: {
        file: './lib/dist/easyroute-core.js',
        format: 'iife',
        name: 'Easyroute'
    }
}

export default [
    es, iife
]