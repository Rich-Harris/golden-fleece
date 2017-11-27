export const whitespace = /\s/;
export const validIdentifier = /[a-zA-Z_$][a-zA-Z0-9_$]*/;
export const number = /^NaN|(?:[-+]?(?:(?:Infinity)|(?:0[xX][a-fA-F0-9]+)|(?:0[bB][01]+)|(?:(?:(?:[1-9]\d*|0)?\.\d+|(?:[1-9]\d*|0)\.\d*|(?:[1-9]\d*|0))(?:[E|e][+|-]?\d+)?)))/

export const SINGLE_QUOTE = "'";
export const DOUBLE_QUOTE = '"';

export function spaces(n: number) {
	let result = '';
	while (n--) result += ' ';
	return result;
}