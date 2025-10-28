import sanitize from "sanitize-html";

// Check the content of the email for possible problems
// Sanitize HTML and check for problems with images and links.
export class ContentClient {
	static async sanitizeHtml(html: string) {
		const sanitizedHtml = sanitize(html, {
			allowedTags: [
				// Basic text formatting
				"p",
				"br",
				"div",
				"span",
				"h1",
				"h2",
				"h3",
				"h4",
				"h5",
				"h6",
				"strong",
				"b",
				"em",
				"i",
				"u",
				"strike",
				"s",
				"del",
				"ins",
				"sub",
				"sup",
				"small",
				"big",
				"code",
				"pre",
				"blockquote",

				// Lists
				"ul",
				"ol",
				"li",

				// Links (but we'll be restrictive with attributes)
				"a",

				// Images (but we'll be restrictive with attributes)
				"img",

				// Tables
				"table",
				"thead",
				"tbody",
				"tfoot",
				"tr",
				"td",
				"th",

				// Other safe elements
				"hr",
				"address",
				"cite",
				"abbr",
				"acronym",
				"time",
			],
			allowedAttributes: {
				a: ["href", "title", "target"],
				img: ["src", "alt", "title", "width", "height"],
				blockquote: ["cite"],
				table: ["border", "cellpadding", "cellspacing"],
				td: ["colspan", "rowspan"],
				th: ["colspan", "rowspan"],
				"*": ["style"], // Allow basic styling
			},
			allowedStyles: {
				"*": {
					// Text styling
					color: [
						/^#(0x)?[0-9a-f]+$/i,
						/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
					],
					"background-color": [
						/^#(0x)?[0-9a-f]+$/i,
						/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
					],
					"font-size": [/^\d+(?:px|em|%|pt)$/],
					"font-weight": [/^(?:normal|bold|bolder|lighter|[1-9]00)$/],
					"font-style": [/^(?:normal|italic|oblique)$/],
					"font-family": [/.*/],
					"text-align": [/^(?:left|right|center|justify)$/],
					"text-decoration": [/^(?:none|underline|overline|line-through)$/],

					// Layout
					margin: [/^\d+(?:px|em|%|pt)(?:\s+\d+(?:px|em|%|pt)){0,3}$/],
					padding: [/^\d+(?:px|em|%|pt)(?:\s+\d+(?:px|em|%|pt)){0,3}$/],
					border: [/.*/],
					width: [/^\d+(?:px|em|%|pt)$/],
					height: [/^\d+(?:px|em|%|pt)$/],
				},
			},
			allowedSchemes: ["http", "https", "mailto"],
			allowedSchemesAppliedToAttributes: ["href", "src"],
			transformTags: {
				// Remove target="_blank" and add rel="noopener noreferrer" for security
				a: (_tagName, attribs) => ({
					tagName: "a",
					attribs: {
						...attribs,
						rel: "noopener noreferrer",
					},
				}),
			},
		});

		return sanitizedHtml;
	}
}
