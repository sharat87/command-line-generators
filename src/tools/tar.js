import m from "mithril";
import Registry from "./Registry";

Registry.set("tar", Component);

function Component() {
	const choices = {
		command: "c",
		verbose: false,
		compressor: "",
		archiveFileName: "archive.tar",
	};

	let copyButtonLabel = "";

	return { view };

	function view() {
		const {errors, explain, cli} = renderCli(choices)
		return [
			m("h2", "What do you want to do?"),
			m("form", [
				m("p", [
					"Command:",
					m("label", m("input", { type: "radio", name: "command", value: "c", checked: "c" === choices.command, onchange(e) {choices.command = e.target.value} }), "Create"),
					m("label", m("input", { type: "radio", name: "command", value: "x", checked: "x" === choices.command, onchange(e) {choices.command = e.target.value} }), "Extract"),
					m("label", m("input", { type: "radio", name: "command", value: "t", checked: "t" === choices.command, onchange(e) {choices.command = e.target.value} }), "List Contents"),
				]),
				m("p", m("label", [
					m("input", { type: "checkbox", name: "verbose", checked: choices.verbose, oninput(e) {choices.verbose = e.target.checked } }),
					"Verbose Output",
				])),
				m("p", m("label", [
					"Archive file name: ",
					m("input", { type: "text", name: "archiveFileName", value: choices.archiveFileName, oninput(e) {choices.archiveFileName = e.target.value } }),
				])),
				m("p", [
					"Compression format:",
					m("label", [
						m("input", { type: "radio", name: "compressor", value: "", checked: choices.compressor === "", onchange(e) {choices.compressor = e.target.value} }),
						"No compression",
					]),
					m("label", [
						m("input", { type: "radio", name: "compressor", value: "a", checked: choices.compressor === "a", onchange(e) {choices.compressor = e.target.value} }),
						"Detect from file name",
					]),
					m("label", [
						m("input", { type: "radio", name: "compressor", value: "j", checked: choices.compressor === "j", onchange(e) {choices.compressor = e.target.value} }),
						"bz2",
					]),
					m("label", [
						m("input", { type: "radio", name: "compressor", value: "z", checked: choices.compressor === "z", onchange(e) {choices.compressor = e.target.value} }),
						"gz",
					]),
				]),
			]),
			m("h2", "Command to run"),
			m("pre.cli", cli),
			m("p", m("button", {
				type: "button",
				onclick() {
					copyText(cli);
					copyButtonLabel = "Copied!";
					setTimeout(() => {
						copyButtonLabel = "";
						m.redraw();
					}, 2000);
				},
			}, copyButtonLabel || "Copy to clipboard")),
			errors.length > 0 && [
				m("h2", "What should I be concerned about?"),
				m("ol", errors.map(e => m("li", m.trust(e)))),
			],
			explain.length > 0 && [
				m("h2", "What will this command achieve?"),
				m("ol", explain.map(e => m("li", m.trust(e)))),
			],
		];
	}
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

function copyText(text) {
	const te = document.createElement('textarea');
	te.style = 'position: fixed; top: 0; left: 0; width: 1px; height: 1px';
	document.body.appendChild(te);
	te.value = text;
	te.select();
	document.execCommand('copy');
	te.remove();
}
