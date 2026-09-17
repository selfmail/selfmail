import sanitize from "sanitize-html";

const color = /^(?:#[\da-f]{3,8}|[a-z]+|rgba?\([\d\s.,%]+\))$/i;
const size = /^(?:0|auto|[\d.]+(?:px|em|rem|%|pt))$/;
const spacing =
	/^(?:0|auto|[\d.]+(?:px|em|rem|%|pt))(?:\s+(?:0|auto|[\d.]+(?:px|em|rem|%|pt))){0,3}$/;
const httpsUrl = /^https:\/\//i;

export function sanitizeEmailHtml(html: string): string {
	return sanitize(html, {
		allowedTags: [...sanitize.defaults.allowedTags, "img"],
		allowedAttributes: {
			"*": ["style", "dir", "lang"],
			a: ["href", "title", "target", "rel"],
			img: ["src", "alt", "width", "height", "title"],
			table: ["width", "border", "cellpadding", "cellspacing"],
			td: ["width", "height", "colspan", "rowspan", "align", "valign"],
			th: ["width", "height", "colspan", "rowspan", "align", "valign"],
		},
		allowedSchemes: ["https", "http", "mailto"],
		allowProtocolRelative: false,
		allowedStyles: {
			"*": {
				color: [color],
				"background-color": [color],
				"font-size": [size],
				"font-family": [/^[\w\s,'"-]+$/],
				"font-weight": [/^(?:normal|bold|[1-9]00)$/],
				"font-style": [/^(?:normal|italic|oblique)$/],
				"text-align": [/^(?:left|right|center|justify)$/],
				"text-decoration": [/^(?:none|underline|line-through)$/],
				"line-height": [/^[\d.]+(?:px|em|rem|%)?$/],
				width: [size],
				"max-width": [size],
				height: [size],
				margin: [spacing],
				padding: [spacing],
				"border-collapse": [/^(?:collapse|separate)$/],
			},
		},
		transformTags: {
			a: (_tag, attributes) => {
				const href = attributes.href;
				return {
					tagName: "a",
					attribs: {
						...attributes,
						// Relative links would resolve against the application's origin.
						href: href && /^(?:https?:\/\/|mailto:)/i.test(href) ? href : "",
						target: "_blank",
						rel: "noopener noreferrer",
					},
				};
			},
			img: (_tag, attributes) => ({
				tagName: "img",
				attribs: {
					...attributes,
					src: httpsUrl.test(attributes.src ?? "") ? attributes.src : "",
				},
			}),
		},
	});
}
