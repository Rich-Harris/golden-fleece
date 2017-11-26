import { validIdentifier } from './shared';

export function stringify(value: any, indentString = '\t', quote = '"') {
	return stringifyValue(value, quote, '', indentString, true);
}

export function stringifyString(str: string, quote: string) {
	return quote + str.replace(quote === "'" ? /'/g : /"/g, '\\' + quote) + quote;
}

export function stringifyProperty(key: string, value: any, quote: string, indentation: string, indentString: string, newlines: boolean): string {
	return (
		(validIdentifier.test(key) ? key : stringifyString(key, quote)) +
		': ' +
		stringifyValue(value, quote, indentation, indentString, newlines)
	);
}

export function stringifyValue(value: any, quote: string, indentation: string, indentString: string, newlines: boolean): string {
	const type = typeof value;

	if (type === 'string') {
		return stringifyString(value, quote);
	}

	if (type === 'number' || type === 'boolean' || value === null) return String(value);

	if (Array.isArray(value)) {
		if (newlines) {
			return `[\n${indentation + indentString}` + (
				value.map(element => stringifyValue(element, quote, indentation + indentString, indentString, true)).join(`,\n${indentation + indentString}`)
			) + `\n${indentation}]`;
		}

		return '[TODO]';
	}

	if (type === 'object') {
		return '{TODO}';
	}

	throw new Error(`Cannot stringify ${type}`);
}