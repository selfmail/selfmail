import DOMPurify from "isomorphic-dompurify";
import { filterXSS } from "xss";
import validator from "validator";
import sanitizeHtml from "sanitize-html";
import { createInboundLog } from "./logs";

const log = createInboundLog("security");

export interface SecurityOptions {
	allowedTags?: string[];
	allowedAttributes?: Record<string, string[]>;
	maxLength?: number;
	stripScripts?: boolean;
	normalizeEmails?: boolean;
}

export interface SanitizationResult {
	content: string;
	modified: boolean;
	threats: string[];
}

export abstract class SecurityService {
	/**
	 * Default security options for email content
	 */
	static readonly DEFAULT_EMAIL_OPTIONS: SecurityOptions = {
		allowedTags: [
			"p", "br", "div", "span", "strong", "b", "em", "i", "u", "ul", "ol", "li",
			"h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code", "a",
			"img", "table", "thead", "tbody", "tr", "td", "th"
		],
		allowedAttributes: {
			"a": ["href", "title", "target"],
			"img": ["src", "alt", "width", "height", "title"],
			"*": ["style", "class", "id"]
		},
		maxLength: 1024 * 1024, // 1MB
		stripScripts: true,
		normalizeEmails: true,
	};

	/**
	 * Strict security options for untrusted content
	 */
	static readonly STRICT_OPTIONS: SecurityOptions = {
		allowedTags: ["p", "br", "strong", "b", "em", "i"],
		allowedAttributes: {},
		maxLength: 10 * 1024, // 10KB
		stripScripts: true,
		normalizeEmails: true,
	};

	/**
	 * Sanitize HTML content using multiple layers of protection
	 * @param html HTML content to sanitize
	 * @param options Security options
	 * @returns Sanitized content with modification info
	 */
	static sanitizeHtml(html: string, options: SecurityOptions = SecurityService.DEFAULT_EMAIL_OPTIONS): SanitizationResult {
		if (!html || typeof html !== "string") {
			return { content: "", modified: false, threats: [] };
		}

		const originalLength = html.length;
		const threats: string[] = [];
		let content = html;

		try {
			// Check for length limits
			if (options.maxLength && content.length > options.maxLength) {
				log(`Content truncated from ${content.length} to ${options.maxLength} characters`);
				content = content.substring(0, options.maxLength);
				threats.push("content_truncated");
			}

			// First pass: DOMPurify for XSS protection
			const purifyConfig = {
				ALLOWED_TAGS: options.allowedTags || [],
				ALLOWED_ATTR: Object.keys(options.allowedAttributes || {}),
				KEEP_CONTENT: true,
				SANITIZE_DOM: true,
				SANITIZE_NAMED_PROPS: true,
				SANITIZE_NAMED_PROPS_PREFIX: "user-content-",
			};

			const purified = DOMPurify.sanitize(content, purifyConfig);
			if (purified !== content) {
				threats.push("xss_content_removed");
				content = purified;
			}

			// Second pass: XSS library for additional protection
			const xssOptions = {
				allowList: options.allowedAttributes || {},
				stripIgnoreTag: true,
				stripIgnoreTagBody: ["script", "style"],
				onIgnoreTag: (tag: string) => {
					if (["script", "iframe", "object", "embed"].includes(tag)) {
						threats.push(`dangerous_tag_${tag}`);
					}
				},
				onIgnoreTagAttr: (_tag: string, name: string, value: string) => {
					if (name.startsWith("on") || value.includes("javascript:")) {
						threats.push("dangerous_attribute");
					}
				},
			};

			const xssFiltered = filterXSS(content, xssOptions);
			if (xssFiltered !== content) {
				threats.push("xss_filtered");
				content = xssFiltered;
			}

			// Third pass: sanitize-html for comprehensive cleaning
			const sanitizeOptions = {
				allowedTags: options.allowedTags || [],
				allowedAttributes: options.allowedAttributes || {},
				allowedSchemes: ["http", "https", "mailto"],
				disallowedTagsMode: "discard" as const,
				enforceHtmlBoundary: true,
			};

			const sanitized = sanitizeHtml(content, sanitizeOptions);
			if (sanitized !== content) {
				threats.push("html_sanitized");
				content = sanitized;
			}

			// Additional security checks
			if (content.includes("<script") || content.includes("javascript:")) {
				log("Potential script injection attempt detected");
				threats.push("script_injection_attempt");
				content = content.replace(/<script[^>]*>.*?<\/script>/gi, "");
				content = content.replace(/javascript:/gi, "");
			}

			// Check for suspicious patterns
			const suspiciousPatterns = [
				/data:text\/html/gi,
				/vbscript:/gi,
				/onload\s*=/gi,
				/onerror\s*=/gi,
				/onclick\s*=/gi,
			];

			for (const pattern of suspiciousPatterns) {
				if (pattern.test(content)) {
					threats.push("suspicious_pattern");
					content = content.replace(pattern, "");
				}
			}

			const modified = content !== html || originalLength !== content.length;
			
			if (threats.length > 0) {
				log(`HTML sanitization completed with threats: ${threats.join(", ")}`);
			}

			return { content, modified, threats };
		} catch (error) {
			log(`HTML sanitization error: ${error}`);
			return { 
				content: SecurityService.stripAllHtml(html), 
				modified: true, 
				threats: ["sanitization_error"] 
			};
		}
	}

	/**
	 * Sanitize plain text content
	 * @param text Plain text to sanitize
	 * @param options Security options
	 * @returns Sanitized text with modification info
	 */
	static sanitizeText(text: string, options: SecurityOptions = SecurityService.DEFAULT_EMAIL_OPTIONS): SanitizationResult {
		if (!text || typeof text !== "string") {
			return { content: "", modified: false, threats: [] };
		}

		const originalText = text;
		const threats: string[] = [];
		let content = text;

		// Check for length limits
		if (options.maxLength && content.length > options.maxLength) {
			content = content.substring(0, options.maxLength);
			threats.push("content_truncated");
		}

		// Remove null bytes and control characters
		const cleanContent = content.split("").filter(char => {
			const code = char.charCodeAt(0);
			// Allow printable ASCII and common whitespace, exclude control chars
			return code >= 32 || code === 9 || code === 10 || code === 13;
		}).join("");
		if (cleanContent !== content) {
			threats.push("control_characters_removed");
			content = cleanContent;
		}

		// Normalize line endings
		content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

		// Check for suspicious content
		const suspiciousPatterns = [
			/javascript:/gi,
			/data:text\/html/gi,
			/vbscript:/gi,
		];

		for (const pattern of suspiciousPatterns) {
			if (pattern.test(content)) {
				threats.push("suspicious_content");
				content = content.replace(pattern, "[REMOVED]");
			}
		}

		const modified = content !== originalText;
		return { content, modified, threats };
	}

	/**
	 * Validate and normalize email addresses
	 * @param email Email address to validate
	 * @returns Normalized email or null if invalid
	 */
	static validateEmail(email: string): string | null {
		if (!email || typeof email !== "string") {
			return null;
		}

		// Basic validation
		if (!validator.isEmail(email)) {
			return null;
		}

		// Normalize email
		try {
			return validator.normalizeEmail(email, {
				gmail_lowercase: true,
				gmail_remove_dots: false,
				yahoo_lowercase: true,
				icloud_lowercase: true,
			}) || null;
		} catch {
			return null;
		}
	}

	/**
	 * Extract and validate URLs from content
	 * @param content Content to scan for URLs
	 * @returns Array of validated URLs
	 */
	static extractValidUrls(content: string): string[] {
		if (!content) return [];

		const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
		const urls = content.match(urlRegex) || [];

		return urls.filter(url => {
			try {
				return validator.isURL(url, {
					protocols: ["http", "https"],
					require_protocol: true,
					require_valid_protocol: true,
					allow_underscores: false,
				});
			} catch {
				return false;
			}
		});
	}

	/**
	 * Strip all HTML tags and return plain text
	 * @param html HTML content
	 * @returns Plain text
	 */
	static stripAllHtml(html: string): string {
		if (!html) return "";

		return html
			.replace(/<br\s*\/?>/gi, "\n")
			.replace(/<\/p>/gi, "\n\n")
			.replace(/<[^>]*>/g, "")
			.replace(/&nbsp;/g, " ")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&amp;/g, "&")
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.trim();
	}

	/**
	 * Validate file attachment security
	 * @param filename Filename to validate
	 * @param contentType MIME type
	 * @param size File size in bytes
	 * @returns Validation result
	 */
	static validateAttachment(filename: string, contentType: string, size: number): {
		valid: boolean;
		threats: string[];
		normalizedFilename: string;
	} {
		const threats: string[] = [];
		let normalizedFilename = filename || "attachment";

		// Sanitize filename
		normalizedFilename = normalizedFilename
			.replace(/[^a-zA-Z0-9.\-_]/g, "_")
			.substring(0, 255);

		// Check for dangerous extensions
		const dangerousExtensions = [
			".exe", ".bat", ".cmd", ".com", ".pif", ".scr", ".vbs", ".js", ".jar",
			".zip", ".rar", ".7z", ".app", ".deb", ".rpm", ".dmg", ".pkg"
		];

		const fileExt = normalizedFilename.toLowerCase().substring(normalizedFilename.lastIndexOf("."));
		if (dangerousExtensions.includes(fileExt)) {
			threats.push("dangerous_file_extension");
		}

		// Check MIME type
		const dangerousMimeTypes = [
			"application/x-executable",
			"application/x-msdownload",
			"application/x-msdos-program",
			"application/javascript",
			"text/javascript",
		];

		if (dangerousMimeTypes.includes(contentType.toLowerCase())) {
			threats.push("dangerous_mime_type");
		}

		// Check file size (max 25MB for email attachments)
		if (size > 25 * 1024 * 1024) {
			threats.push("file_too_large");
		}

		const valid = threats.length === 0;
		return { valid, threats, normalizedFilename };
	}

	/**
	 * Generate content security hash for integrity checking
	 * @param content Content to hash
	 * @returns SHA-256 hash
	 */
	static async generateContentHash(content: string): Promise<string> {
		if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
			// Browser environment
			const encoder = new TextEncoder();
			const data = encoder.encode(content);
			const hash = await globalThis.crypto.subtle.digest("SHA-256", data);
			return Array.from(new Uint8Array(hash))
				.map(b => b.toString(16).padStart(2, "0"))
				.join("");
		}
		
		// Node.js environment
		const crypto = await import("node:crypto");
		return crypto.createHash("sha256").update(content).digest("hex");
	}
}
