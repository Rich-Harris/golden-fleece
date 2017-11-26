import Parser from './Parser';
import { Node } from './interfaces';

export function parse(str: string) {
	const parser = new Parser(str);
	return parser.value;
}

export function evaluate(str: string) {
	const ast = parse(str);
	return getValue(ast);
}

function getValue(node: Node) {
	if (node.type === 'Literal') {
		return node.value;
	}

	if (node.type === 'ArrayExpression') {
		return node.elements.map(getValue);
	}

	if (node.type === 'ObjectExpression') {
		const obj: Record<string, any> = {};
		node.properties.forEach((prop: Node) => {
			obj[prop.key.name] = getValue(prop.value);
		});
		return obj;
	}
}