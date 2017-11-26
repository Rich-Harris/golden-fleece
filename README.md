# golden-fleece

Parse a string representing a JavaScript object (like JSON, but less strict — like [JSON5](http://json5.org/)).

## Why?

For the [Svelte REPL](https://svlte.technology/repl), where we want to allow arbitrary data in the bottom right-hand panel, but we also want to update the object without reformatting it as JSON.


## Usage

```js
import { parse } from 'golden-fleece';

const parsed = parse(`{
	number: 1,
	string: 'yes',
	object: {
		nested: true
	},
	array: [
		'this',
		'that',
		'the-other'
	]
}`);

parsed.find('string');
// { TODO }
```

## License

[LIL](LICENSE)