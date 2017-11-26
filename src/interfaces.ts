export interface Node {
	start: number;
	end: number;
	type: string;
}

export type Value = ObjectExpression | ArrayExpression | Literal;

export interface Identifier extends Node {
	type: 'Identifier';
	name: string;
}

export interface Property extends Node {
	type: 'Property';
	key: Identifier | Literal;
	value: Value;
}

export interface ObjectExpression extends Node {
	type: 'ObjectExpression';
	properties: Property[];
}

export interface ArrayExpression extends Node {
	type: 'ArrayExpression';
	elements: Value[];
}

export interface Literal extends Node {
	type: 'Literal';
	raw: string;
	value: string | number | boolean | null;
	name?: string; // cheeky hack to allow object property code to always check `name`
}

export interface Comment extends Node {
	type: 'Comment';
	block: boolean;
	text: string;
}

export interface ParserOptions {
	onComment?: (comment: Comment) => void;
	onValue?: (value: Value) => void;
}

export interface StringifierOptions {
	spaces?: number;
	singleQuotes?: boolean;
	compact?: boolean;
}