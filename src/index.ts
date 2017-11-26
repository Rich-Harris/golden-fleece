import Parser from './Parser';
import { Node } from './interfaces';

export function parse(str: string) {
	const parser = new Parser(str);
	return parser.value;
}