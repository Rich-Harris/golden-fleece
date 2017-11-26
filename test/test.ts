import * as assert from 'assert';
import * as fleece from '../src/index';
import {
	Value,
	ArrayExpression,
	ObjectExpression,
	Literal,
	Property,
	Identifier,
	Comment
} from '../src/interfaces';

describe('golden-fleece', () => {
	describe('parse', () => {
		const tests: Array<{
			solo?: boolean;
			skip?: boolean;
			input: string;
			output?: Value;
			comments?: Comment[];
			error?: RegExp;
		}> = [
			// booleans
			{
				input: `true`,
				output: {
					start: 0,
					end: 4,
					type: 'Literal',
					raw: 'true',
					value: true
				}
			},

			{
				input: `false`,
				output: {
					start: 0,
					end: 5,
					type: 'Literal',
					raw: 'false',
					value: false
				}
			},

			// numbers
			{
				input: `1`,
				output: {
					start: 0,
					end: 1,
					type: 'Literal',
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
					type: 'Literal',
					raw: "'single-quotes'",
					value: 'single-quotes'
				}
			},

			{
				input: '"double-quotes"',
				output: {
					start: 0,
					end: 15,
					type: 'Literal',
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
					type: 'ObjectExpression',
					properties: []
				}
			},

			{
				input: `{ foo: 1, "bar": 2 }`,
				output: {
					start: 0,
					end: 20,
					type: 'ObjectExpression',
					properties: [
						{
							start: 2,
							end: 8,
							type: 'Property',
							key: {
								start: 2,
								end: 5,
								type: 'Identifier',
								name: 'foo'
							},
							value: {
								start: 7,
								end: 8,
								type: 'Literal',
								raw: '1',
								value: 1
							}
						},

						{
							start: 10,
							end: 18,
							type: 'Property',
							key: {
								start: 10,
								end: 15,
								type: 'Literal',
								raw: '"bar"',
								value: 'bar',
								name: 'bar'
							},
							value: {
								start: 17,
								end: 18,
								type: 'Literal',
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
					type: 'ObjectExpression',
					properties: [{
						start: 2,
						end: 17,
						type: 'Property',
						key: {
							start: 2,
							end: 7,
							type: 'Identifier',
							name: 'array'
						},
						value: {
							start: 9,
							end: 17,
							type: 'ArrayExpression',
							elements: [{
								start: 11,
								end: 15,
								type: 'Literal',
								value: true,
								raw: 'true'
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
					type: 'ArrayExpression',
					elements: []
				}
			},

			{
				input: `[true]`,
				output: {
					start: 0,
					end: 6,
					type: 'ArrayExpression',
					elements: [{
						start: 1,
						end: 5,
						type: 'Literal',
						value: true,
						raw: 'true'
					}]
				}
			},

			{
				input: `[true true]`,
				error: /expected ',' or ']'/
			},

			// null
			{
				input: 'null',
				output: {
					start: 0,
					end: 4,
					type: 'Literal',
					raw: 'null',
					value: null
				}
			},

			// comments
			{
				input: '[ true, /*comment*/ false ]',
				output: {
					start: 0,
					end: 27,
					type: 'ArrayExpression',
					elements: [
						{
							start: 2,
							end: 6,
							type: 'Literal',
							raw: 'true',
							value: true
						},
						{
							start: 20,
							end: 25,
							type: 'Literal',
							raw: 'false',
							value: false
						}
					]
				},
				comments: [
					{
						start: 8,
						end: 19,
						type: 'Comment',
						block: false,
						text: 'comment'
					}
				]
			}
		];

		tests.forEach((test, i) => {
			const padded = test.input.split('\n').map(line => `      ${line}`).join('\n');

			(test.solo ? it.only : test.skip ? it.skip : it)(`test ${i}\n${padded} `, () => {
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

	describe('evaluate', () => {
		const tests: Array<{
			solo?: boolean;
			skip?: boolean;
			input: string;
			output?: any;
		}> = [
			{
				input: `true`,
				output: true
			},

			{
				input: `{ foo: 1, "bar": 2 }`,
				output: { foo: 1, bar: 2 }
			}
		];

		tests.forEach((test, i) => {
			const padded = test.input.split('\n').map(line => `      ${line}`).join('\n');

			(test.solo ? it.only : test.skip ? it.skip : it)(`test ${i}\n${padded} `, () => {
				const value = fleece.evaluate(test.input);
				assert.deepEqual(value, test.output);
			});
		});
	});

	describe('patch', () => {
		it('patches a string with a numeric value', () => {
			assert.equal(
				fleece.patch(`  1  `, 42),
				`  42  `
			);
		});
	});
});