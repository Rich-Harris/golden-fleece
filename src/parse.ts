import Parser from './Parser';
import {
	ParserOptions,
	Value,
	ArrayExpression,
	ObjectExpression,
	Literal,
	Property,
	Identifier
} from './interfaces';

export function parse(str: string, opts?: ParserOptions) {
	const parser = new Parser(str, opts);
	return parser.value;
}