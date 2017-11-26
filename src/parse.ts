import Parser from './Parser';
import {
	Options,
	Value,
	ArrayExpression,
	ObjectExpression,
	Literal,
	Property,
	Identifier
} from './interfaces';

export default function parse(str: string, opts?: Options) {
	const parser = new Parser(str, opts);
	return parser.value;
}