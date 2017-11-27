import { whitespace, validIdentifier } from './shared';
import {
	ParserOptions,
	Value,
	ArrayExpression,
	ObjectExpression,
	Literal,
	Property,
	Identifier,
	Comment
} from './interfaces';

export function parse(str: string, opts?: ParserOptions) {
	const parser = new Parser(str, opts);
	return parser.value;
}

type ParserState = (parser: Parser) => (ParserState | void);

function noop(){}

export default class Parser {
	str: string;
	index: number;
	value: Value;

	onComment: (comment: Comment) => void;
	onValue: (value: Value) => void;

	constructor(str: string, opts?: ParserOptions) {
		this.str = str;
		this.index = 0;

		this.onComment = (opts && opts.onComment) || noop;
		this.onValue = (opts && opts.onValue) || noop;

		this.value = this.readValue();
		this.allowWhitespaceOrComment();

		if (this.index < this.str.length) {
			throw new Error(`Unexpected character '${this.peek()}'`)
		}
	}

	allowWhitespaceOrComment() {
		while (
			this.index < this.str.length &&
			whitespace.test(this.str[this.index])
		) {
			this.index++;
		}

		const start = this.index;

		if (this.eat('/')) {
			if (this.eat('/')) {
				// line comment
				const text = this.readUntil(/(?:\r\n|\n|\r)/);

				this.onComment({
					start,
					end: this.index,
					type: 'Comment',
					text,
					block: false
				});

				this.eat('\n');
			} else if (this.eat('*')) {
				// block comment
				const text = this.readUntil(/\*\//);

				this.onComment({
					start,
					end: this.index,
					type: 'Comment',
					text,
					block: true
				});

				this.eat('*/');
			}
		} else {
			return;
		}

		this.allowWhitespaceOrComment();
	}

	error(message: string, index = this.index) {
		throw new Error(message); // TODO
		// throw new ParseError(message, this.template, index, this.filename);
	}

	eat(str: string, required?: boolean) {
		if (this.match(str)) {
			return true;
		}

		if (required) {
			this.error(`Expected ${str}`);
		}

		return false;
	}

	match(str: string) {
		if (this.str.slice(this.index, this.index + str.length) === str) {
			this.index += str.length;
			return str;
		}
	}

	peek() {
		return this.str[this.index];
	}

	read(pattern: RegExp) {
		const match = pattern.exec(this.str.slice(this.index));
		if (!match || match.index !== 0) return null;

		this.index += match[0].length;

		return match[0];
	}

	readUntil(pattern: RegExp) {
		if (this.index >= this.str.length)
			this.error('Unexpected end of input');

		const start = this.index;
		const match = pattern.exec(this.str.slice(start));

		if (match) {
			const start = this.index;
			this.index = start + match.index;
			return this.str.slice(start, this.index);
		}

		this.index = this.str.length;
		return this.str.slice(start);
	}

	readArray(): ArrayExpression {
		const start = this.index;
		if (!this.eat('[')) return null;

		const array: ArrayExpression = {
			start,
			end: null,
			type: 'ArrayExpression',
			elements: []
		};

		this.allowWhitespaceOrComment();

		while (this.peek() !== ']') {
			array.elements.push(this.readValue());
			this.allowWhitespaceOrComment();

			if (!this.eat(',')) break;

			this.allowWhitespaceOrComment();
		}

		if (!this.eat(']')) {
			this.error(`expected ',' or ']'`);
		}

		array.end = this.index;
		return array;
	}

	readBoolean(): Literal {
		const start = this.index;

		const raw = this.read(/^(true|false)/);

		if (raw) {
			return {
				start,
				end: this.index,
				type: 'Literal',
				raw,
				value: raw === 'true'
			};
		}
	}

	readNull(): Literal {
		const start = this.index;

		if (this.match('null')) {
			return {
				start,
				end: this.index,
				type: 'Literal',
				raw: 'null',
				value: null
			};
		}
	}

	readLiteral(): Literal {
		return (
			this.readBoolean() ||
			this.readNumber() ||
			this.readString() ||
			this.readNull()
		);
	}

	readNumber(): Literal {
		const start = this.index;

		const raw = (
			this.match('NaN') ||
			this.read(/[-+]?Infinity/) ||
			this.read(/[-+]?0[xX][a-fA-F0-9]+/) ||
			this.read(/[-+]?0[bB][01]+/) ||
			this.read(/^(?:[-+]?(?:(?:(?:[1-9]\d*|0)?\.\d+|(?:[1-9]\d*|0)\.\d*|(?:[1-9]\d*|0))(?:[E|e][+|-]?\d+)?))/)
		);

		if (raw) {
			const sign = raw[0];

			let value = +(sign === '-' || sign === '+' ? raw.slice(1) : raw);
			if (sign === '-') value = -value;

			return {
				start,
				end: this.index,
				type: 'Literal',
				raw,
				value
			};
		}
	}

	readObject(): ObjectExpression {
		const start = this.index;

		if (!this.eat('{')) return;

		const object: ObjectExpression = {
			start,
			end: null,
			type: 'ObjectExpression',
			properties: []
		};

		this.allowWhitespaceOrComment();

		while (this.peek() !== '}') {
			object.properties.push(this.readProperty());
			this.allowWhitespaceOrComment();

			if (!this.eat(',')) break;

			this.allowWhitespaceOrComment();
		}

		this.eat('}', true);

		object.end = this.index;
		return object;
	}

	readProperty(): Property {
		this.allowWhitespaceOrComment();

		const property: Property = {
			start: this.index,
			end: null,
			type: 'Property',
			key: this.readPropertyKey(),
			value: this.readValue()
		};

		property.end = this.index;
		return property;
	}

	readIdentifier(): Identifier {
		const start = this.index;

		const name = this.read(validIdentifier);

		if (name) {
			return {
				start,
				end: this.index,
				type: 'Identifier',
				name
			};
		}
	}

	readPropertyKey(): Identifier | Literal {
		const start = this.index;

		const key = this.readString() || this.readIdentifier();

		if (key.type === 'Literal') {
			key.name = String(key.value);
		}

		this.allowWhitespaceOrComment();
		this.eat(':', true);

		return key;
	}

	readString(): Literal {
		const start = this.index;

		const quote = this.read(/^['"]/);
		if (!quote) return;

		let escaped = false;
		let char: string;
		let value: string = '';

		while (this.index < this.str.length) {
			const char = this.str[this.index++];

			if (escaped) {
				if (char !== '\r' || this.str[this.index] !== '\n') {
					escaped = false;
					if (char === quote) value += char;
				}
			} else if (char === '\\') {
				escaped = true;
			} else if (char === quote) {
				const end = this.index;

				return {
					start,
					end,
					type: 'Literal',
					raw: this.str.slice(start, end),
					value
				};
			} else {
				value += char;
			}
		}

		this.error(`Unexpected end of input`);
	}

	readValue(): Value {
		this.allowWhitespaceOrComment();

		const value = (
			this.readArray() ||
			this.readObject() ||
			this.readLiteral()
		);

		if (value) {
			this.onValue(value);
			return value;
		}

		throw new Error(`Expected a value`);
	}
}