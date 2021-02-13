import m from "mithril";
import Registry from "./Registry";
import { copyText } from "..//utils";

Registry.set("ffmpeg", Component);

function Component() {
	const choices = {
		inputFile: "input.mp4",
		outputFile: "out.gif",
		from: "",
		to: "",
		fps: "10",
	};

	let copyButtonLabel = "";

	return { view };

	function view() {
		const { cli, notes } = renderCli(choices)
		return [
			m("form", [
				m("p", m("label", [
					"Input file:",
					m("input", { type: "text", value: choices.inputFile, oninput(e) {choices.inputFile = e.target.value } }),
				])),
				m("p", m("label", [
					"Output file:",
					m("input", { type: "text", value: choices.outputFile, oninput(e) {choices.outputFile = e.target.value } }),
				])),
				m("p", m("label", [
					"Start offset (in seconds)",
					m("input", { type: "text", value: choices.from, oninput(e) {choices.from = e.target.value } }),
				])),
				m("p", m("label", [
					"Limit length of output video (in seconds)",
					m("input", { type: "text", value: choices.to, oninput(e) {choices.to = e.target.value } }),
				])),
				m("p", m("label", [
					"Required frame rate",
					m("input", { type: "text", value: choices.fps, oninput(e) {choices.fps = e.target.value } }),
				])),
			]),
			notes.length > 0 && [
				m("h2", "Notes"),
				m("ul", notes.map(e => m("li", m.trust(e)))),
			],
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
		];
	}
}

function renderCli(choices) {
	const parts = ["ffmpeg"];
	const vf = [];
	const notes = [];

	if (choices.from) {
		parts.push("-ss", choices.from);
	}

	if (choices.to) {
		parts.push("-t", choices.to);
	}

	if (choices.inputFile) {
		parts.push("-i", "'" + choices.inputFile + "'");
	}

	if (choices.fps) {
		vf.push("fps=" + choices.fps)
	}

	if (choices.outputFile) {
		if (choices.outputFile.endsWith(".gif")) {
			if (!choices.fps) {
				notes.push("You may want to set FPS to a low value like 10 or 15 when converting to GIFs.");
			}
			vf.push("scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse");
			parts.push("-vf", "'" + vf.join(",") + "'");
			parts.push("-loop", 0);
		}
		parts.push("-o", "'" + choices.outputFile + "'");
	}

	return {
		cli: parts.join(" "),
		notes,
	};
}
