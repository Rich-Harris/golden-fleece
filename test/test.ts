import * as assert from 'assert';
import * as fleece from '../src/index';

const tests: any[] = [
	// booleans
	{
		input: `true`,
		output: {
			start: 0,
			end: 4,
			type: 'Boolean',
			value: true
		}
	},

	{
		input: `false`,
		output: {
			start: 0,
			end: 5,
			type: 'Boolean',
			value: false
		}
	},

	// numbers
	{
		input: `1`,
		output: {
			start: 0,
			end: 1,
			type: 'Number',
			raw: '1',
			value: 1
		}
	},

	// strings
	{
		input: "'single-quotes'",
		output: {
			start: 0,
			end: 15,
			type: 'String',
			raw: "'single-quotes'",
			value: 'single-quotes'
		}
	},

	{
		input: '"double-quotes"',
		output: {
			start: 0,
			end: 15,
			type: 'String',
			raw: '"double-quotes"',
			value: 'double-quotes'
		}
	},

	// objects
	{
		input: `{}`,
		output: {
			start: 0,
			end: 2,
			type: 'Object',
			children: []
		}
	},

	{
		input: `{ foo: 1, bar: 2 }`,
		output: {
			start: 0,
			end: 18,
			type: 'Object',
			children: [
				{
					start: 2,
					end: 8,
					type: 'Property',
					key: {
						start: 2,
						end: 5,
						type: 'Key',
						raw: 'foo',
						value: 'foo'
					},
					value: {
						start: 7,
						end: 8,
						type: 'Number',
						raw: '1',
						value: 1
					}
				},

				{
					start: 10,
					end: 16,
					type: 'Property',
					key: {
						start: 10,
						end: 13,
						type: 'Key',
						raw: 'bar',
						value: 'bar'
					},
					value: {
						start: 15,
						end: 16,
						type: 'Number',
						raw: '2',
						value: 2
					}
				}
			]
		}
	},

	{
		input: `{ array: [ true ] }`,
		output: {
			start: 0,
			end: 19,
			type: 'Object',
			children: [{
				start: 2,
				end: 17,
				type: 'Property',
				key: {
					start: 2,
					end: 7,
					type: 'Key',
					raw: 'array',
					value: 'array'
				},
				value: {
					start: 9,
					end: 17,
					type: 'Array',
					children: [{
						start: 11,
						end: 15,
						type: 'Boolean',
						value: true
					}]
				}
			}]
		}
	},

	// arrays
	{
		input: `[]`,
		output: {
			start: 0,
			end: 2,
			type: 'Array',
			children: []
		}
	},

	{
		input: `[true]`,
		output: {
			start: 0,
			end: 6,
			type: 'Array',
			children: [{
				start: 1,
				end: 5,
				type: 'Boolean',
				value: true
			}]
		}
	},

	{
		input: `[true true]`,
		error: /expected ',' or ']'/
	}
]

describe('golden-fleece', () => {
	tests.forEach((test, i) => {
		it(`test ${i}`, () => {
			if (test.error) {
				assert.throws(() => {
					fleece.parse(test.input);
				}, test.error);
			} else {
				const parsed = fleece.parse(test.input);
				assert.deepEqual(parsed, test.output);
			}
		});
	});
});