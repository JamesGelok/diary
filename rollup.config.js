import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import types from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const MODULE = () => ({
	external:[
		...require('module').builtinModules,
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.peerDependencies || {})
	],
	plugins: [
		resolve({
			extensions: ['.mjs', '.js', '.ts'],
			preferBuiltins: true
		}),
		typescript({}),
	],
});

const TYPES = () => ({
	plugins: [
		resolve({
			extensions: ['.js', '.ts'],
			preferBuiltins: true,
		}),
		types(),
	],
});


const make = file => ({
	format: /\.(mj|\.d\.t)s$/.test(file) ? 'esm' : 'cjs',
	sourcemap: false,
	esModule: false,
	interop: false,
	strict: false,
	file: file,
});

export default [
	{
		...MODULE(),
		input: 'src/index.ts',
		output: [
			make(pkg['exports']['.']['import']),
			make(pkg['exports']['.']['require']),
			{
				...make(pkg['exports']['.']['import']),
				file: 'lib/index.min.mjs',
				plugins: [terser()],
			},
		],
	},
	{
		...MODULE(),
		input: 'src/index.ts',
		output: [
			{
				...make(pkg['unpkg']),
				name: pkg.name,
				format: 'umd',
				plugins: [terser()],
			},
		]
	},
	{
		...TYPES(),
		input: 'src/index.ts',
		output: make('types/index.d.ts'),
	},
];
