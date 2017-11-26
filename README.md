# golden-fleece

Parse a string representing a JavaScript object (like JSON, but less strict — like [JSON5](http://json5.org/)).

## Why?

For the [Svelte REPL](https://svlte.technology/repl), where we want to allow arbitrary data in the bottom right-hand panel, but we also want to update the object without reformatting it as JSON.


## Usage

```js
import * as fleece from 'golden-fleece';

const str = `{
	number: 1,
	string: 'yes',
	object: { nested: true },
	array: ['this', 'that', 'the other']
}`

// generate an ESTree-compliant AST
const ast = fleece.parse(str);
// { start: 0, end: 108, type: 'ObjectExpression', properties: [...] }

// evaluate a string
const value = fleece.evaluate(str);
value.number; // 1

// patch a string without changing the formatting
value.number = 42;
value.array[2] = 'EVERYTHING';
const patched = fleece.patch(str, value);

patched === `{
	number: 42,
	string: 'yes',
	object: { nested: true },
	array: ['this', 'that', 'EVERYTHING']
}`; // true
```

## License

[LIL](LICENSE)