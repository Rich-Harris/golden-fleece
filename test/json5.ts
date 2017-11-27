import * as fs from 'fs';
import * as assert from 'assert';
import * as glob from 'glob';
import * as fleece from '../src/index';

export default () => {
	describe('parses JSON', () => {
		const files = glob.sync('test/**/*.json');

		files.forEach(file => {
			(solo(file) ? it.only : it)(file, () => {
				const source = fs.readFileSync(file, 'utf-8');

				assert.deepEqual(
					fleece.evaluate(source),
					JSON.parse(source)
				);
			});
		});
	});

	describe('parses JSON5', () => {
		const files = glob.sync('test/**/*.json5');

		files.forEach(file => {
			(solo(file) ? it.only : it)(file, () => {
				const source = fs.readFileSync(file, 'utf-8');

				const actual = fleece.evaluate(source);
				const expected = eval(`(\n${source}\n)`);

				if (actual !== actual) {
					// NaN
					assert.ok(expected !== expected);
				} else {
					assert.deepEqual(actual, expected);
				}
			});
		});
	});
};

function solo(file: string) {
	return /\.solo\./.test(file);
}