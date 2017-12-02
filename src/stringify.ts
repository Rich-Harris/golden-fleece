import { spaces, validIdentifier } from './shared';
import { StringifierOptions } from './interfaces';

export function stringify(value: any, options: StringifierOptions) {
	const quote = options.singleQuotes ? "'" : '"';
	const indentString = options.spaces ? spaces(options.spaces) : '\t';

	return stringifyValue(value, quote, '\n', indentString, true);
}

export function stringifyString(str: string, quote: string) {
	return quote + str.replace(quote === "'" ? /'/g : /"/g, '\\' + quote) + quote;
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
		(validIdentifier.test(key) ? key : stringifyString(key, quote)) +
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
