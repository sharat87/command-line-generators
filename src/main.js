import m from "mithril";
import "./tools/tar";
import "./tools/ffmpeg";
import Registry from "./tools/Registry";

window.onload = appMain;

function appMain() {
	const root = document.createElement("main")
	root.setAttribute("id", "app")
	document.body.insertAdjacentElement("afterbegin", root)

	m.route(root, "/tar", {
		"/:tool": ToolRenderer,
		// TODO: "/:404...": errorPageComponent,
	})
}

const ToolRenderer = {
	view(vnode) {
		const { tool } = vnode.attrs;
		return [
			m(AsideCom),
			m("section", m(".content", [
				m("h1.title", ["The ", m("code", tool), " command line generator"]),
				m(Registry.get(tool)),
				m("footer", [
					m("span", [
						"Created and curated by ",
						m("a", { href: "https://sharats.me", target: "_blank" }, "Shrikant Sharat Kandula"),
						".",
					]),
					m("a", { href: "https://github.com/sharat87/command-line-generators", target: "_blank" }, "Source on GitHub"),
				]),
			])),
		];
	},
};

function AsideCom() {
	return { view };

	function view() {
		const links = []
		for (const name of Registry.keys()) {
			links.push(m(m.route.Link, { href: "/" + name }, name));
		}
		return m("aside", [
			m("h2", "CLI Gen"),
			m(".tool-links", links),
		]);
	}
}
