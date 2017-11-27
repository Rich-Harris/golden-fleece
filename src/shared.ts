export const whitespace = /\s/;
export const validIdentifier = /[a-zA-Z_$][a-zA-Z0-9_$]*/;

export function spaces(n: number) {
	let result = '';
	while (n--) result += ' ';
	return result;
}