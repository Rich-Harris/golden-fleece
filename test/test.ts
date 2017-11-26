import * as assert from 'assert';
import * as fleece from '../src/index';

describe('golden-fleece', () => {
	// array
	describe('parse', () => {
		it('parses an empty object', () => {
			const parsed = fleece.parse(`{}`);

			assert.deepEqual(parsed, {
				start: 0,
				end: 2,
				type: 'Object',
				properties: []
			});
		});
	});
});