import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import fileSize from 'rollup-plugin-filesize';
import pkg from './package.json';

const env = process.env.NODE_ENV;

const config = {
    input: `./src/index.js`,
    external: [
        ...Object.keys(pkg.peerDependencies || {}),
        ...Object.keys(pkg.dependencies || {})
    ],
    output: [
        {
            file: `./dist/es/index.js`,
            format: 'es',
            name: pkg.name,
            globals: {
                react: 'React',
                redux: 'Redux',
                'react-dom': 'ReactDom',
                'react-redux': 'ReactRedux',
                'lodash-es': 'lodash'
            }
        },
        {
            file: `./dist/umd/index.js`,
            format: 'umd',
            name: pkg.name,
            globals: {
                react: 'React',
                redux: 'Redux',
                'react-dom': 'ReactDom',
                'react-redux': 'ReactRedux',
                'lodash-es': 'lodash'
            }
        }
    ],
    plugins: [
        nodeResolve(),
        commonjs(),
        babel({
            exclude: '**/node_modules/**',
            babelHelpers: 'runtime'
        }),
        replace({
            ENV: JSON.stringify(process.env.NODE_ENV),
            preventAssignment: true
        })
    ]
};

if (env === 'production') {
    config.plugins.push(terser());
}

config.plugins.push(fileSize());

export default config;
