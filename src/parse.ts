import {
	number,
	whitespace,
	validIdentifierCharacters,
	SINGLE_QUOTE,
	DOUBLE_QUOTE
} from './shared';
import { locate } from 'locate-character';
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

class ParseError extends Error {
	pos: number;
	loc: {
		line: number;
		column: number;
	}

	constructor(message: string, pos: number, loc: { line: number, column: number }) {
		super(message);

		this.pos = pos;
		this.loc = loc;
	}
}

// https://mathiasbynens.be/notes/javascript-escapes
const escapeable: Record<string, string> = {
	b: '\b',
	n: '\n',
	f: '\f',
	r: '\r',
	t: '\t',
	v: '\v',
	0: '\0'
};

const hex = /^[a-fA-F0-9]+$/;

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

				this.eat('*/', true);
			}
		} else {
			return;
		}

		this.allowWhitespaceOrComment();
	}

	error(message: string, index = this.index) {
		const loc = locate(this.str, index, { offsetLine: 1 });
		throw new ParseError(message, index, loc);
	}

	eat(str: string, required?: boolean) {
		if (this.str.slice(this.index, this.index + str.length) === str) {
			this.index += str.length;
			return str;
		}

		if (required) {
			this.error(`Expected '${str}' instead of '${this.str[this.index]}'`);
		}

		return null;
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
			this.error(`Expected ']' instead of '${this.str[this.index]}'`);
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

		if (this.eat('null')) {
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

		const raw = this.read(number);

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

		const name = this.read(validIdentifierCharacters);

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

		if (!key) this.error(`Bad identifier as unquoted key`);

		if (key.type === 'Literal') {
			key.name = String(key.value);
		}

		this.allowWhitespaceOrComment();
		this.eat(':', true);

		return key;
	}

	readString(): Literal {
		const start = this.index;

		// const quote = this.read(/^['"]/);
		const quote = this.eat(SINGLE_QUOTE) || this.eat(DOUBLE_QUOTE);
		if (!quote) return;

		let escaped = false;
		let char: string;
		let value: string = '';

		while (this.index < this.str.length) {
			const char = this.str[this.index++];

			if (escaped) {
				escaped = false;

				// line continuations
				if (char === '\n') continue;
				if (char === '\r') {
					if (this.str[this.index] === '\n') this.index += 1;
					continue;
				}

				if (char === 'x' || char === 'u') {
					const start = this.index;
					const end = this.index += (char === 'x' ? 2 : 4);

					const code = this.str.slice(start, end);
					if (!hex.test(code)) this.error(`Invalid ${char === 'x' ? 'hexadecimal' : 'Unicode'} escape sequence`, start);

					value += String.fromCharCode(parseInt(code, 16));
				}

				else {
					value += escapeable[char] || char;
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
				if (char === '\n') this.error(`Bad string`, this.index - 1);
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

		this.error(`Unexpected EOF`);
	}
}