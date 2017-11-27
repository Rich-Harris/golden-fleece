#!/usr/bin/env node
'use strict';

// TODO this whole thing is a bit of a horrorshow, tidy it up

const glob = require('glob');
const { Suite } = require('benchmark');
const fs = require('fs');
const rightPad = require('right-pad');
const chalk = require('chalk');
const JSON5 = require('json5');
const fleece = require('../golden-fleece.umd.js');

function getFixtures(ext) {
	return glob.sync(`**/*.${ext}`, { cwd: 'test/json5-tests' });
}

const queue = [];

function test(file) {
	const source = fs.readFileSync(`test/json5-tests/${file}`, 'utf-8');

	const suite = new Suite();

	suite.add('json5', () => {
		JSON5.parse(source);
	});

	suite.add('fleece', () => {
		fleece.evaluate(source);
	});

	// suite.add('JSON', () => {
	// 	JSON.parse(source);
	// });

	queue.push({
		title: file,
		suite
	});
}

getFixtures('json').forEach(test);
getFixtures('json5').forEach(test);

function next() {
	if (queue.length === 0) {
		console.log('done');
		return;
	}

	const { title, suite } = queue.shift();

	console.log(chalk.bold(title));

	suite.on('complete', () => {
		const fastest = suite.filter('fastest')[0];

		suite.forEach(benchmark => {
			let result = `  ${benchmark === fastest ? chalk.green('✓') : ' '}`;
			result += ` ${rightPad(benchmark.name, 8)}: ${format(benchmark.hz)}Hz`;
			if (benchmark !== fastest) result += ` (${(100 * benchmark.hz / fastest.hz).toFixed(1)}%)`
			console.log(result);
		});

		next();
	});

	suite.run();
}

next();

function format(num) {
	if (num > 1e6) return (num / 1e6).toFixed(1) + 'M';
	if (num > 1e3) return (num / 1e3).toFixed(1) + 'k';
	return num.toFixed(1);
}

// function test(fixture, sourcemap) {
// 	const content = fs.readFileSync(`test/fixture/input/${fixture}`, 'utf8');
// 	const size = prettyBytes(Buffer.byteLength(content, 'utf8'));

// 	console.log(`${fixture} (${size}) ${sourcemap ? 'with' : 'without'} sourcemap:`);

// 	const suite = new Suite();

// 	libs.forEach(name => {
// 		suite.add(name, () => {
// 			minify(content, sourcemap);
// 		});
// 	});

// 	suite.on('error', ({ target: { error } }) => {
// 		throw error;
// 	});

// 	suite.on('cycle', ({ target }) => {
// 		const r = results[target.name];
// 		r[sourcemap ? 'sourcemap' : 'nosourcemap'] = 1e3 / target.hz;

// 		printResult(results, target.name, sourcemap);
// 	});

// 	suite.on('complete', () => {
// 		fs.writeFileSync(
// 			`test/bench/results/${fixture}on`,
// 			JSON.stringify(results, null, '  ')
// 		);
// 	});

// 	suite.run();
// }

// fixtures.forEach(fixture => {
// 	if ( fixture === '_test.js' ) return;

// 	test(fixture, false);
// 	test(fixture, true);
// });
