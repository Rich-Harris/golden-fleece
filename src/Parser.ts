import { whitespace } from './patterns';
import { Node } from './interfaces';

type ParserState = (parser: Parser) => (ParserState | void);

const validIdentifier = /[a-zA-Z_$][a-zA-Z0-9_$]*/;

export default class Parser {
	str: string;
	index: number;
	value: Node;

	constructor(str: string) {
		this.str = str;
		this.index = 0;

		this.value = this.readValue();
		this.allowWhitespace();

		if (this.index < this.str.length) {
			throw new Error(`Unexpected character '${this.peek()}'`)
		}
	}

	acornError(err: any) {
		this.error(err.message.replace(/ \(\d+:\d+\)$/, ''), err.pos);
	}

	allowWhitespace() {
		while (
			this.index < this.str.length &&
			whitespace.test(this.str[this.index])
		) {
			this.index++;
		}
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

	readBoolean(value: boolean): Node {
		return {
			start: this.index - (value ? 4 : 5),
			end: this.index,
			type: 'Boolean',
			value
		};
	}

	readArray(): Node {
		const array: Node = {
			start: this.index - 1,
			end: null,
			type: 'Array',
			children: []
		};

		this.allowWhitespace();

		while (this.peek() !== ']') {
			array.children.push(this.readValue());
			this.allowWhitespace();

			if (!this.eat(',')) break;

			this.allowWhitespace();
		}

		if (!this.eat(']')) {
			this.error(`expected ',' or ']'`);
		}

		array.end = this.index;
		return array;
	}

	readNumber(): Node {
		const start = this.index;
		const raw = this.read(/^(?:NaN|-?(?:(?:\d*\.\d+|\d+)(?:[E|e][+|-]?\d+)?|Infinity))/);

		return {
			start,
			end: this.index,
			type: 'Number',
			raw,
			value: +raw
		};
	}

	readObject(): Node {
		const object: Node = {
			start: this.index - 1,
			end: null,
			type: 'Object',
			children: []
		};

		this.allowWhitespace();

		while (this.peek() !== '}') {
			object.children.push(this.readProperty());
			this.allowWhitespace();

			if (!this.eat(',')) break;

			this.allowWhitespace();
		}

		this.eat('}', true);

		object.end = this.index;
		return object;
	}

	readProperty(): Node {
		this.allowWhitespace();

		const property: Node = {
			start: this.index,
			end: null,
			type: 'Property',
			key: this.readPropertyKey(),
			value: this.readValue()
		};

		property.end = this.index;
		return property;
	}

	readPropertyKey(): Node {
		const start = this.index;
		const quote = this.read(/^'"/);

		let key: Node;

		if (quote) {
			key = this.readString(quote);
		} else {
			const name = this.read(validIdentifier);
			key = {
				start,
				end: this.index,
				type: 'Key',
				raw: name,
				value: name
			};
		}

		this.allowWhitespace();
		this.eat(':', true);

		return key;
	}

	readString(quote: string): Node {
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
					type: 'String',
					raw: this.str.slice(start, end),
					value: this.str.slice(start + 1, end - 1)
				};
			}
		}

		this.error(`Unexpected end of input`);
	}

	readValue(): Node {
		this.allowWhitespace();

		if (this.eat('[')) return this.readArray();
		if (this.eat('{')) return this.readObject();
		if (this.eat('true')) return this.readBoolean(true);
		if (this.eat('false')) return this.readBoolean(false);
		if (this.eat("'")) return this.readString("'");
		if (this.eat('"')) return this.readString('"');
		if (/(\d|\.)/.test(this.peek())) return this.readNumber();

		console.log('still here!', this.remaining());
	}

	remaining() {
		return this.str.slice(this.index);
	}

	requireWhitespace() {
		if (!whitespace.test(this.str[this.index])) {
			this.error(`Expected whitespace`);
		}

		this.allowWhitespace();
	}
}