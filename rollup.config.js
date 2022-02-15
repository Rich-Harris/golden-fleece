import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';

export default {
	input: 'src/index.ts',
	output: [
		{ file: pkg.main, format: 'umd', name: pkg.name },
		{ file: pkg.module, format: 'es' }
	],
	name: 'fleece',
	plugins: [
		typescript({
			typescript: require('typescript'),
			declaration: true
		}),
		resolve()
	]
};