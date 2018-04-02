import { spaces, entirelyValidIdentifier } from './shared';
import { StringifierOptions } from './interfaces';

export function stringify(value: any, options?: StringifierOptions) {
	const quote = (options && options.singleQuotes) ? "'" : '"';
	const indentString = (options && options.spaces) ? spaces(options.spaces) : '\t';

	return stringifyValue(value, quote, '\n', indentString, true);
}

// https://github.com/json5/json5/blob/65bcc556eb629984b33bb2163cbc10fba4597300/src/stringify.js#L110
const escapeable: Record<string, string> = {
	"'": "'",
	'"': '"',
	'\\': '\\',
	'\b': 'b',
	'\f': 'f',
	'\n': 'n',
	'\r': 'r',
	'\t': 't',
	'\v': 'v',
	'\0': '0',
	'\u2028': 'u2028',
	'\u2029': 'u2029',
};
const escapeableRegex = /['"\\\b\f\n\r\t\v\0\u2028\u2029]/g;

export function stringifyString(str: string, quote: string) {
	const otherQuote = quote === '"' ? "'" : '"';
	return quote + str.replace(escapeableRegex, char =>
		char === otherQuote ? char : '\\' + escapeable[char]
	) + quote;
}

export function stringifyProperty(
	key: string,
	value: any,
	quote: string,
	indentation: string,
	indentString: string,
	newlines: boolean
): string {
	return (
		(entirelyValidIdentifier.test(key) ? key : stringifyString(key, quote)) +
		': ' +
		stringifyValue(value, quote, indentation, indentString, newlines)
	);
}

export function stringifyValue(
	value: any,
	quote: string,
	indentation: string,
	indentString: string,
	newlines: boolean
): string {
	const type = typeof value;

	if (type === 'string') {
		return stringifyString(value, quote);
	}

	if (type === 'number' || type === 'boolean' || value === null)
		return String(value);

	if (Array.isArray(value)) {
		const elements = value.map(element =>
			stringifyValue(
				element,
				quote,
				indentation + indentString,
				indentString,
				true
			)
		);

		if (newlines) {
			return (
				`[\n${indentation + indentString}` +
				elements.join(`,\n${indentation + indentString}`) +
				`\n${indentation}]`
			);
		}

		return `[ ${elements.join(', ')} ]`;
	}

	if (type === 'object') {
		const keys = Object.keys(value);
		const properties = keys.map(key =>
			stringifyProperty(
				key,
				value[key],
				quote,
				indentation + indentString,
				indentString,
				newlines
			)
		);

		if (newlines) {
			return (
				`{${indentation + indentString}` +
				properties.join(`,${indentation + indentString}`) +
				`${indentation}}`
			);
		}

		return `{ ${properties.join(', ')} }`;
	}

	throw new Error(`Cannot stringify ${type}`);
}
