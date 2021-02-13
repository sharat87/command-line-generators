export function copyText(text) {
	const te = document.createElement('textarea');
	te.style = 'position: fixed; top: 0; left: 0; width: 1px; height: 1px';
	document.body.appendChild(te);
	te.value = text;
	te.select();
	document.execCommand('copy');
	te.remove();
}
