import { whitespace, validIdentifier } from './shared';
import {
	Value,
	Property,
	Identifier,
	ObjectExpression,
	ArrayExpression,
	Literal,
	Comment,
	Options
} from './interfaces';

type ParserState = (parser: Parser) => (ParserState | void);

function noop(){}

export default class Parser {
	str: string;
	index: number;
	value: Value;

	onComment: (comment: Comment) => void;
	onValue: (value: Value) => void;

	constructor(str: string, opts?: Options) {
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

	acornError(err: any) {
		this.error(err.message.replace(/ \(\d+:\d+\)$/, ''), err.pos);
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
				const text = this.readUntil(/\n/);

				this.onComment({
					start,
					end: this.index,
					type: 'Comment',
					text,
					block: false
				});
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
			this.index += str.length;
			return true;
		}

		if (required) {
			this.error(`Expected ${str}`);
		}

		return false;
	}

	match(str: string) {
		return this.str.slice(this.index, this.index + str.length) === str;
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
		const array: ArrayExpression = {
			start: this.index - 1,
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

	readLiteral(value: boolean | null): Literal {
		const raw = String(value);

		return {
			start: this.index - raw.length,
			end: this.index,
			type: 'Literal',
			raw,
			value
		};
	}

	readNumber(): Literal {
		const start = this.index;
		const raw = this.read(/^(?:NaN|-?(?:(?:\d*\.\d+|\d+)(?:[E|e][+|-]?\d+)?|Infinity))/);

		return {
			start,
			end: this.index,
			type: 'Literal',
			raw,
			value: +raw
		};
	}

	readObject(): ObjectExpression {
		const object: ObjectExpression = {
			start: this.index - 1,
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

	readPropertyKey(): Identifier | Literal {
		const start = this.index;
		const quote = this.read(/^['"]/);

		let key: Identifier | Literal;

		if (quote) {
			key = this.readString(quote);
			key.name = String(key.value);
		} else {
			const name = this.read(validIdentifier);
			key = {
				start,
				end: this.index,
				type: 'Identifier',
				name
			};
		}

		this.allowWhitespaceOrComment();
		this.eat(':', true);

		return key;
	}

	readString(quote: string): Literal {
		const start = this.index - 1;

		let escaped = false;
		let char: string;
		while (this.index < this.str.length) {
			const char = this.str[this.index++];

			if (escaped) {
				escaped = false;
			} else if (char === '\\') {
				escaped = true;
			} else if (char === quote) {
				const end = this.index;

				return {
					start,
					end,
					type: 'Literal',
					raw: this.str.slice(start, end),
					value: this.str.slice(start + 1, end - 1)
				};
			}
		}

		this.error(`Unexpected end of input`);
	}

	readValue(): Value {
		this.allowWhitespaceOrComment();

		if (this.eat('[')) return this.readArray();
		if (this.eat('{')) return this.readObject();
		if (this.eat('true')) return this.readLiteral(true);
		if (this.eat('false')) return this.readLiteral(false);
		if (this.eat('null')) return this.readLiteral(null);
		if (this.eat("'")) return this.readString("'");
		if (this.eat('"')) return this.readString('"');
		if (/(\d|\.)/.test(this.peek())) return this.readNumber();
	}

	remaining() {
		return this.str.slice(this.index);
	}

	requireWhitespace() {
		if (!whitespace.test(this.str[this.index])) {
			this.error(`Expected whitespace`);
		}

		this.allowWhitespaceOrComment();
	}
}