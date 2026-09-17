export function emailHtmlDocument(html: string, loadImages: boolean): string {
	const policy = `default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src ${loadImages ? "https:" : "'none'"}; base-uri 'none'; form-action 'none'`;
	return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:16px;color:#18181b;background:#fff;font:14px/1.5 sans-serif;overflow-wrap:anywhere}img{max-width:100%;height:auto}table{max-width:100%}pre{white-space:pre-wrap}a{color:#1d4ed8}</style></head><body>${html}</body></html>`;
}
