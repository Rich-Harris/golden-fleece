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

const queue = [].concat(
	glob.sync(`**/*.json`, { cwd: 'test/json5-tests' }),
	glob.sync(`**/*.json5`, { cwd: 'test/json5-tests' })
);

function next() {
	if (queue.length === 0) {
		console.log('done');
		return;
	}

	const file = queue.shift();

	const source = fs.readFileSync(`test/json5-tests/${file}`, 'utf-8');

	console.log(chalk.bold(file));

	const suite = new Suite();

	suite.add('json5', () => {
		JSON5.parse(source);
	});

	suite.add('fleece', () => {
		fleece.evaluate(source);
	});

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