import typescript from '@rollup/plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import cleaner from 'rollup-plugin-cleaner';

export default {
    input: './lib/src/index.ts',
    plugins: [
        cleaner({
            targets: [
                './lib/dist'
            ]
        }),
        typescript(),
        resolve({ extensions: ['.js', '.ts'] }),
        commonjs({ extensions: ['.js', '.ts'] })
    ],
    output: {
        dir: './lib/dist',
        format: 'umd',
        name: 'easyroute'
    }
}