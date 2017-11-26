import { whitespace } from './patterns';
import { Node } from './interfaces';

type ParserState = (parser: Parser) => (ParserState | void);

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
			elements: []
		};

		this.allowWhitespace();

		while (this.peek() !== ']') {
			const element = this.readValue();
			this.allowWhitespace();

			if (!this.eat(',')) break;

			this.allowWhitespace();
		}

		this.eat(']', true);

		array.end = this.index;
		return array;
	}

	readObject(): Node {
		const object: Node = {
			start: this.index - 1,
			end: null,
			type: 'Object',
			properties: []
		};

		this.allowWhitespace();

		while (this.peek() !== '}') {
			const element = this.readValue();
			this.allowWhitespace();

			if (!this.eat(',')) break;

			this.allowWhitespace();
		}

		this.eat('}', true);

		object.end = this.index;
		return object;
	}

	readValue() {
		this.allowWhitespace();

		if (this.eat('[')) return this.readArray();
		if (this.eat('{')) return this.readObject();
		if (this.match('true')) return this.readBoolean(true);
		if (this.match('false')) return this.readBoolean(false);

		// TODO strings, numbers
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