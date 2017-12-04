# golden-fleece

Parse a [JSON5](http://json5.org/) string (like JSON, but less strict).

## Why?

For the [Svelte REPL](https://svelte.technology/repl), where we want to allow arbitrary data in the bottom right-hand panel, but we also want to update the object without reformatting it as JSON.


## Usage

Install it with `npm install golden-fleece` and import it into your app:

```js
import * as fleece from 'golden-fleece';
```

### fleece.parse(str, [options])

```js
const ast = fleece.parse(`true`);
// { start: 0, end: 4, type: 'Literal', raw: 'true', value: true }
```

The returned AST is [ESTree](https://github.com/estree/estree) compliant.

You can optionally pass callbacks that are fired whenever a value or comment is encountered:

```js
const ast = fleece.parse(str, {
	onComment: comment => {
		console.log('got a comment', comment);
	},
	onValue: value => {
		console.log('got a value', value);
	}
});
```


### fleece.evaluate(str)

```js
const { answer } = fleece.evaluate(`{ answer: 42 }`);
answer === 42; // true
```


### fleece.patch(str, value)

This is where it gets fun:

```js
const str = `
	number: 1,
	string: 'yes',
	object: { nested: true },
	array: ['this', 'that', 'the other']
`;

const object = fleece.evaluate(str);
object.number = 42;
object.array[2] = 'EVERYTHING';

fleece.patch(str, object) === `{
	number: 42,
	string: 'yes',
	object: { nested: true },
	array: ['this', 'that', 'EVERYTHING']
}`; // true
```

Notice that the formatting has been preserved.


### fleece.stringify(value, [options])


```js
const object = {
	string: 'hello',
	'quoted-property': 2,
	array: [3, 4]
};

fleece.stringify(object) === `{
	string: "hello",
	"quoted-property": 2,
	array: [
		3,
		4
	]
}`; // true
```

To indent with spaces instead of tabs, pass `spaces: n`, where `n` is the number of spaces at each level of indentation.

```js
fleece.stringify(object, {
	spaces: 2
}) === `{
  string: "hello",
  "quoted-property": 2,
  array: [
    3,
    4
  ]
}`; // true
```

To prefer single-quotes to double-quotes, pass `singleQuotes: true`:

```js
fleece.stringify(object, {
	singleQuotes: true
}) === `{
	string: 'hello',
	'quoted-property': 2,
	array: [
		3,
		4
	]
}`; // true
```


## License

[LIL](LICENSE)
