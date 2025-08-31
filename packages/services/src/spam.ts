import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Clam from "clamscan";
import MailComposer from "nodemailer/lib/mail-composer";
import sanitize from "sanitize-html";

type Schema = {
	to: string;
	from: string;

	subject: string;
	body: string;
	html: string;
	attachments?: File[];
};

export abstract class Spam {
	private static clamscanInstance: Promise<Clam> | null = null;

	private static async getClamscan() {
		if (!Spam.clamscanInstance) {
			Spam.clamscanInstance = new Clam().init({
				clamdscan: {
					host: "127.0.0.1",
					port: 3310,
					timeout: 300000, // 5 Minutes
				},
				preference: "clamdscan", // Use clamd daemon
				debugMode: false,
			});
		}
		return Spam.clamscanInstance;
	}

	static async checkRspamd({
		body,
		from,
		subject,
		to,
		html,
		attachments,
	}: Schema): Promise<{
		isSpam: boolean;
		score: number;
		symbols: string[];
		action: string;
	}> {
		try {
			const mail = new MailComposer({
				from,
				to,
				subject,
				text: body,
				html,
				attachments: attachments
					? await Promise.all(
							attachments.map(async (file) => ({
								filename: file.name,
								content: Buffer.from(await file.arrayBuffer()),
							})),
						)
					: undefined,
			});

			const eml = await new Promise<Buffer>((resolve, reject) =>
				mail
					.compile()
					.build((err, message) => (err ? reject(err) : resolve(message))),
			);

			// Send email to Rspamd for analysis
			const response = await fetch("http://127.0.0.1:11333/checkv2", {
				method: "POST",
				headers: {
					"Content-Type": "message/rfc822",
				},
				body: eml,
			});

			if (!response.ok) {
				console.error(
					`Rspamd check failed: ${response.status} ${response.statusText}`,
				);
				// If Rspamd is unavailable, err on the side of caution but don't block
				return {
					isSpam: false,
					score: 0,
					symbols: [],
					action: "no action",
				};
			}

			const result = (await response.json()) as {
				score: number;
				action: string;
				symbols: Record<string, { score: number; description: string }>;
				required_score: number;
			};

			const symbols = Object.keys(result.symbols || {});
			const isSpam =
				result.action === "reject" ||
				result.action === "soft reject" ||
				result.score >= result.required_score;

			console.log(
				`Rspamd check - Score: ${result.score}, Action: ${result.action}, Symbols: ${symbols.join(", ")}`,
			);

			return {
				isSpam,
				score: result.score,
				symbols,
				action: result.action,
			};
		} catch (error) {
			console.error("Error checking with Rspamd:", error);
			// If there's an error, don't block the email but log it
			return {
				isSpam: false,
				score: 0,
				symbols: [],
				action: "no action",
			};
		}
	}

	static async virus(attachments: File[]): Promise<boolean> {
		try {
			const clam = await Spam.getClamscan();

			// Create temporary files from File objects
			const tempFiles: string[] = [];

			for (const attachment of attachments) {
				// Generate a unique temporary file path
				const tempPath = join(
					tmpdir(),
					`clamscan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				);

				// Convert File to ArrayBuffer and then to Buffer
				const arrayBuffer = await attachment.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);

				// Write the file to temp location
				await writeFile(tempPath, buffer);
				tempFiles.push(tempPath);
			}

			try {
				// Scan all temporary files
				for (const tempFile of tempFiles) {
					const result = await clam.scanFile(tempFile);

					if (result.isInfected) {
						console.warn(
							`Virus detected in attachment: ${result.file} - ${result.viruses?.join(", ")}`,
						);
						return true;
					}
				}

				return false;
			} finally {
				// Clean up temporary files
				for (const tempFile of tempFiles) {
					try {
						await unlink(tempFile);
					} catch (error) {
						console.error(
							`Failed to delete temporary file ${tempFile}:`,
							error,
						);
					}
				}
			}
		} catch (_) {
			// Error while checking for any virus, return true to indicate virus
			return true;
		}
	}

	static async check(emailData: Schema): Promise<{
		allow: boolean;
		warning: string | null;
	}> {
		const warnings: string[] = [];

		// checking for any viruses
		if (emailData.attachments && emailData.attachments.length > 0) {
			const hasVirus = await Spam.virus(emailData.attachments);
			if (hasVirus) {
				return {
					allow: false,
					warning: "Virus detected in attachments",
				};
			}
		}

		// Sanitize HTML content if present
		if (emailData.html) {
			const sanitizedHtml = await Spam.sanitizeHtml(emailData.html);
			// Check if the sanitized HTML is significantly different (potential XSS attempt)
			if (sanitizedHtml.length < emailData.html.length * 0.8) {
				warnings.push("Suspicious HTML content detected and removed");
			}
		}

		// Check with Rspamd for spam detection
		const rspamdResult = await Spam.checkRspamd(emailData);

		if (rspamdResult.isSpam) {
			return {
				allow: false,
				warning: `Email flagged as spam by Rspamd. Score: ${rspamdResult.score}, Action: ${rspamdResult.action}`,
			};
		}

		// If Rspamd score is high but not blocking, add a warning
		if (rspamdResult.score > 5) {
			warnings.push(
				`High spam score detected: ${rspamdResult.score} (symbols: ${rspamdResult.symbols.join(", ")})`,
			);
		}

		return {
			allow: true,
			warning: warnings.length > 0 ? warnings.join("; ") : null,
		};
	}

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
