class TestScope {
	constructor() {
		this.log = [];
		this.assertCount = 0;
		this.failedAssertCount = 0;
	}

	runTest(testFn) {
		const summaryIndex = this.log.length;
		this.log.push(`<details><summary>${testFn.name}</summary>`);
		const prevFailCount = this.failedAssertCount;
		testFn(this);
		if (prevFailCount < this.failedAssertCount) {
			this.log[summaryIndex] = this.log[summaryIndex]
				.replace('</summary>', ` :: <span class=fail>${this.failedAssertCount - prevFailCount} fail(s)</span></summary>`);
		}
		this.log.push(`</details>`);
	}

	report(root) {
		root.insertAdjacentHTML('beforeEnd', `Failed on ${this.failedAssertCount}/${this.assertCount} asserts.\n\n`);
		root.insertAdjacentHTML('beforeEnd', this.log.join('\n'));
	}

	assertEqual(left, right) {
		const lineNum = new Error().stack.split('\n')[2].match(/:(\d+):/)[1];
		this.assertCount += 1;
		let result = left === right ? 'pass' : 'fail';
		this.log.push(`<span class=${result}>${lineNum}: assertEqual ${result}</span>`);
		if (result === 'fail') {
			this.failedAssertCount += 1;
		}
	}
}

function runTests() {
	const scope = new TestScope;
	for (const key of Object.keys(window)) {
		if (key.startsWith('test') && window[key] instanceof Function)
			scope.runTest(window[key]);
	}

	scope.report(document.getElementById('testResultsBox'));
}

function testTarCreate(scope) {
	const {cli} = renderCli({
		command: 'c',
		verbose: false,
		compressor: '',
		archiveFileName: '',
	});
	scope.assertEqual(cli, 'tar -c');
}

function testVerboseOption(scope) {
	const {cli} = renderCli({
		command: 'c',
		verbose: true,
		compressor: '',
		archiveFileName: '',
	});
	scope.assertEqual(cli, 'tar -cv');
}

function testTarCreateBz2(scope) {
	const {cli} = renderCli({
		command: 'c',
		verbose: false,
		compressor: 'j',
		archiveFileName: '',
	});
	scope.assertEqual(cli, 'tar -cj');
}

function testTarCreateGz(scope) {
	const {cli} = renderCli({
		command: 'c',
		verbose: false,
		compressor: 'z',
		archiveFileName: '',
	});
	scope.assertEqual(cli, 'tar -cz');
}

function testTarCreateAuto(scope) {
	const {cli} = renderCli({
		command: 'c',
		verbose: false,
		compressor: 'a',
		archiveFileName: 'pack.tar.gz',
	});
	scope.assertEqual(cli, 'tar -caf pack.tar.gz');
}

function testTarCreateGzFileNameWithoutExt(scope) {
	const {cli} = renderCli({
		command: 'c',
		verbose: false,
		compressor: 'z',
		archiveFileName: 'pack',
	});
	scope.assertEqual(cli, 'tar -czf pack.tar.gz');
}

function testTarCreateBz2FileNameWithoutExt(scope) {
	const {cli} = renderCli({
		command: 'c',
		verbose: false,
		compressor: 'j',
		archiveFileName: 'pack',
	});
	scope.assertEqual(cli, 'tar -cjf pack.tar.bz2');
}

function testTarCreateAutoWithoutFileName(scope) {
	const {errors, cli} = renderCli({
		command: 'c',
		verbose: false,
		compressor: 'a',
		archiveFileName: '',
	});
	scope.assertEqual(cli, 'tar -ca');
	scope.assertEqual(errors.length, 1); //[]);
}
