export const whitespace = /\s/;
export const validIdentifierCharacters = /[a-zA-Z_$][a-zA-Z0-9_$]*/;
export const entirelyValidIdentifier = new RegExp('^' + validIdentifierCharacters.source + '$');
export const number = /^NaN|(?:[-+]?(?:(?:Infinity)|(?:0[xX][a-fA-F0-9]+)|(?:0[bB][01]+)|(?:0[oO][0-7]+)|(?:(?:(?:[1-9]\d*|0)?\.\d+|(?:[1-9]\d*|0)\.\d*|(?:[1-9]\d*|0))(?:[E|e][+|-]?\d+)?)))/

export const SINGLE_QUOTE = "'";
export const DOUBLE_QUOTE = '"';

export function spaces(n: number) {
	let result = '';
	while (n--) result += ' ';
	return result;
}