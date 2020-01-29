const paramFormEl = document.getElementById('paramForm');

function appMain() {
	updateCliDisplay();
	paramFormEl.addEventListener('change', updateCliDisplay);
	paramFormEl.addEventListener('keydown', () => setTimeout(updateCliDisplay));
}

function renderCli(choices) {
	const errors = [];

	let fileName = '';
	if (choices.archiveFileName) {
		fileName = choices.archiveFileName;
		if (!fileName.match(/\.tar(\.\w*)?$/)) {
			if (!fileName.endsWith('.tar'))
				fileName += '.tar';
			switch (choices.compressor) {
				case 'j': fileName += '.bz2'; break;
				case 'z': fileName += '.gz'; break;
			}
		}
	}

	const cli = [
		'tar -',
		choices.command,
		choices.verbose ? 'v' : '',
		choices.compressor,
		fileName ? ('f ' + fileName) : '',
	];

	if (choices.compressor === 'a' && !choices.archiveFileName)
		errors.push('Using auto without a file name is not very useful.' +
			' <br><b>Fix:</b> Add a file name or choose a specific compression format.');

	const explain = [];

	switch (choices.command) {
		case 'c':
			explain.push('Creates an archive');
			if (choices.archiveFileName === '') {
				explain[explain.length - 1] += ', and writes it to stdout.';
			} else {
				explain[explain.length - 1] +=
					` to the file at ${fileName} (overwritten if already exists).`;
			}
			break;

		case 'x':
			explain.push('Extracts the archive' + (
				choices.archiveFileName ? (' ' + fileName) : ' from standard input.'));
			break;

		case 't':
			explain.push('Lists contents of the archive' + (
				choices.archiveFileName ? (' ' + fileName) : ' from standard input.'));
			break;
	}

	const compressionPrefix = choices.command === 'c' ? 'C' : 'Dec';
	switch (choices.compressor) {
		case 'a':
			explain.push(compressionPrefix + 'ompression tool will be chosen automatically, based on the file name.');
			break;

		case 'j':
			explain.push(compressionPrefix + 'ompressed using bz2.');
			break;

		case 'z':
			explain.push(compressionPrefix + 'ompressed using gz.');
			break;

		case '':
			explain.push('No ' + compressionPrefix.toLowerCase() + 'ompression applied.');
	}

	if (choices.verbose) {
		explain.push('Files will be printed out as they are being added to the archive.');
	}

	return {errors, explain, cli: cli.join('')};
}

const errorsBoxEl = document.getElementById('errorsBox'),
	explainBoxEl = document.getElementById('explainBox');

function updateCliDisplay() {
	const {errors, explain, cli} = renderCli({
		command: paramFormEl.command.value,
		verbose: paramFormEl.verbose.checked,
		compressor: paramFormEl.compressor.value,
		archiveFileName: paramFormEl.archiveFileName.value,
	});

	errorsBoxEl.innerHTML = errors.map((e) => '<li>' + e).join('\n');
	errorsBoxEl.previousElementSibling.style.display = errorsBoxEl.innerHTML.length ? '' : 'none'
	explainBoxEl.innerHTML = explain.map((e) => '<li>' + e).join('\n');
	explainBoxEl.previousElementSibling.style.display = explainBoxEl.innerHTML.length ? '' : 'none'
	document.getElementById('cliDisplay').innerText = cli;
}

function copyAsOneLine(event) {
	const content = document.getElementById('cliDisplay').innerText.trim();

	const te = document.createElement('textarea');
	te.style = 'position: fixed; top: 0; left: 0; width: 1px; height: 1px';
	document.body.appendChild(te);
	te.value = content;
	te.select();
	document.execCommand('copy');
	te.remove();

	const btn = event.target;
	const prevText = btn.innerText;
	btn.style.width = btn.offsetWidth + 'px';
	btn.innerText = 'Copied!';
	btn.disabled = 1;
	setTimeout(() => {
		btn.style.width = '';
		btn.innerText = prevText;
		btn.removeAttribute('disabled');
	}, 1000);
}
