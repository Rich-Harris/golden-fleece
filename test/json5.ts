import * as fs from 'fs';
import * as assert from 'assert';
import * as glob from 'glob';
import * as fleece from '../src/index';

const skip = new Set([
	'todo/unicode-escaped-unquoted-key.json5',
	'todo/unicode-unquoted-key.json5',
	'comments/top-level-inline-comment.txt',
	'strings/unescaped-multi-line-string.txt'
]);

export default () => {
	function test(file: string, callback: (source: string) => void) {
		(solo(file) ? it.only : skip.has(file) ? it.skip : it)(file, () => {
			const source = read(file);
			callback(source);
		});
	}

	describe('parses JSON', () => {
		getFixtures('json').forEach(file => {
			test(file, source => {
				assert.deepEqual(
					fleece.evaluate(source),
					JSON.parse(source)
				);
			});
		});
	});

	describe('parses JSON5', () => {
		getFixtures('json5').forEach(file => {
			test(file, source => {
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

	describe('fails to parse valid JS that is invalid JSON5', () => {
		getFixtures('js').forEach(file => {
			test(file, source => {
				assert.throws(() => {
					fleece.evaluate(source);
				});
			});
		});
	});

	describe('fails to parse invalid JSON5', () => {
		getFixtures('txt').forEach(file => {
			test(file, source => {
				const errorSpec = read(file.replace(/(\.solo)?.txt$/, '.errorSpec'));

				let parsed;

				try {
					fleece.evaluate(source);
					parsed = true;
				} catch (err) {
					if (errorSpec) {
						const expected = eval(`(${errorSpec})`);

						assert.equal(err.message, expected.message);
						assert.equal(err.pos, expected.at - 1); // pos is zero based
						assert.equal(err.loc.line, expected.lineNumber);
						assert.equal(err.loc.column, expected.columnNumber - 1); // loc.column is zero based

						// TODO locations etc
					}
				}

				assert.ok(!parsed, 'should not parse');
			});
		});
	});
};

function solo(file: string) {
	return /\.solo\./.test(file);
}

function getFixtures(ext: string) {
	return glob.sync(`**/*.${ext}`, { cwd: 'test/json5-tests' });
}

function read(file: string) {
	try {
		return fs.readFileSync(`test/json5-tests/${file}`, 'utf-8');
	} catch (err) {
		return null;
	}
}