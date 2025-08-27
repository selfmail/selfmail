import type { ParsedMail } from "mailparser";
import z from "zod";
import { SecurityService } from "./security";

// Email attachment schema with security info
const EmailAttachmentSchema = z.object({
	filename: z.string().optional(),
	contentType: z.string().optional(),
	size: z.number().optional(),
	content: z.string().optional(), // base64 encoded content
	cid: z.string().optional(), // content ID for inline attachments
	securityThreats: z.array(z.string()).optional(),
	isSecure: z.boolean().optional(),
});

// Security info schema
const SecurityInfoSchema = z.object({
	textModified: z.boolean(),
	htmlModified: z.boolean(),
	subjectModified: z.boolean(),
	threats: z.array(z.string()),
	secureAttachments: z.number(),
	totalAttachments: z.number(),
});

// Common email address schema
const EmailAddressSchema = z.object({
	name: z.string().optional(),
	address: z.string().email(),
});

// Inbound email schema - for emails received by the SMTP server
const InboundEmailSchema = z.object({
	messageId: z.string().optional(),
	from: z.union([EmailAddressSchema, z.string().email()]),
	to: z.union([
		z.array(EmailAddressSchema),
		z.array(z.string().email()),
		EmailAddressSchema,
		z.string().email(),
	]),
	cc: z
		.union([
			z.array(EmailAddressSchema),
			z.array(z.string().email()),
			EmailAddressSchema,
			z.string().email(),
		])
		.optional(),
	bcc: z
		.union([
			z.array(EmailAddressSchema),
			z.array(z.string().email()),
			EmailAddressSchema,
			z.string().email(),
		])
		.optional(),
	subject: z.string().default(""),
	text: z.string().optional(),
	html: z.string().optional(),
	date: z.date().default(() => new Date()),
	attachments: z.array(EmailAttachmentSchema).default([]),
	headers: z
		.record(z.string(), z.union([z.string(), z.array(z.string())]))
		.optional(),
	sessionId: z.string().optional(),
	remoteAddress: z.string().optional(),
	securityInfo: SecurityInfoSchema.optional(),
});

// Outbound email schema - for emails being sent through the SMTP server
const OutboundEmailSchema = z.object({
	messageId: z.string().optional(),
	from: z.string().email(),
	to: z.union([z.array(z.string().email()), z.string().email()]),
	cc: z.union([z.array(z.string().email()), z.string().email()]).optional(),
	bcc: z.union([z.array(z.string().email()), z.string().email()]).optional(),
	subject: z.string().min(1, "Subject is required"),
	text: z.string().optional(),
	html: z.string().optional(),
	attachments: z.array(EmailAttachmentSchema).default([]),
	headers: z.record(z.string(), z.string()).optional(),
	priority: z.enum(["high", "normal", "low"]).default("normal"),
	addressId: z.string().uuid(), // Required for outbound emails to identify the sender
});

// Spam check schema
const SpamCheckSchema = z.object({
	body: z.string(),
	subject: z.string(),
	html: z.string().optional(),
	from: z.string().email(),
	to: z.string().email(),
	attachments: z.array(z.any()).optional(), // File objects
});

export type InboundEmail = z.infer<typeof InboundEmailSchema>;
export type OutboundEmail = z.infer<typeof OutboundEmailSchema>;
export type EmailAttachment = z.infer<typeof EmailAttachmentSchema>;
export type SpamCheck = z.infer<typeof SpamCheckSchema>;

export abstract class Parse {
	static async inboundEmail(
		email: ParsedMail,
		sessionId?: string,
		remoteAddress?: string,
	): Promise<InboundEmail> {
		// Extract and validate email addresses
		const fromAddress =
			email.from?.value?.[0]?.address || email.from?.text || "";
		const validatedFrom =
			SecurityService.validateEmail(fromAddress) || fromAddress;

		const toAddresses = Array.isArray(email.to)
			? email.to
					.map((addr) => {
						const address = addr.text || addr.value?.[0]?.address || "";
						return SecurityService.validateEmail(address) || address;
					})
					.filter(Boolean)
			: [
					SecurityService.validateEmail(
						email.to?.text || email.to?.value?.[0]?.address || "",
					) || "",
				].filter(Boolean);

		// Sanitize content
		const textResult = email.text
			? SecurityService.sanitizeText(email.text)
			: { content: "", modified: false, threats: [] };
		const htmlResult = email.html
			? SecurityService.sanitizeHtml(String(email.html))
			: { content: "", modified: false, threats: [] };
		const subjectResult = email.subject
			? SecurityService.sanitizeText(
					email.subject,
					SecurityService.STRICT_OPTIONS,
				)
			: { content: "", modified: false, threats: [] };

		// Validate and sanitize attachments
		const sanitizedAttachments =
			email.attachments?.map((att) => {
				const validation = SecurityService.validateAttachment(
					att.filename || "unknown",
					att.contentType || "application/octet-stream",
					att.size || 0,
				);

				return {
					filename: validation.normalizedFilename,
					contentType: att.contentType || undefined,
					size: att.size || undefined,
					content: att.content?.toString("base64") || undefined,
					cid: att.cid || undefined,
					securityThreats: validation.threats,
					isSecure: validation.valid,
				};
			}) || [];

		const emailData = {
			messageId: email.messageId || undefined,
			from: validatedFrom,
			to: toAddresses.length > 0 ? toAddresses : toAddresses[0] || "",
			cc: email.cc
				? Array.isArray(email.cc)
					? email.cc
							.map((addr) => {
								const address = addr.text || addr.value?.[0]?.address || "";
								return SecurityService.validateEmail(address) || address;
							})
							.filter(Boolean)
					: [
							SecurityService.validateEmail(
								email.cc.text || email.cc.value?.[0]?.address || "",
							) || "",
						].filter(Boolean)
				: undefined,
			bcc: email.bcc
				? Array.isArray(email.bcc)
					? email.bcc
							.map((addr) => {
								const address = addr.text || addr.value?.[0]?.address || "";
								return SecurityService.validateEmail(address) || address;
							})
							.filter(Boolean)
					: [
							SecurityService.validateEmail(
								email.bcc.text || email.bcc.value?.[0]?.address || "",
							) || "",
						].filter(Boolean)
				: undefined,
			subject: subjectResult.content,
			text: textResult.content || undefined,
			html: htmlResult.content || undefined,
			date: email.date || new Date(),
			attachments: sanitizedAttachments,
			headers: email.headers
				? Object.fromEntries(
						Object.entries(email.headers).map(([key, value]) => [
							key,
							Array.isArray(value) ? value.join(", ") : String(value),
						]),
					)
				: undefined,
			sessionId,
			remoteAddress,
			// Add security metadata
			securityInfo: {
				textModified: textResult.modified,
				htmlModified: htmlResult.modified,
				subjectModified: subjectResult.modified,
				threats: [
					...textResult.threats,
					...htmlResult.threats,
					...subjectResult.threats,
					...sanitizedAttachments.flatMap((att) => att.securityThreats || []),
				],
				secureAttachments: sanitizedAttachments.filter((att) => att.isSecure)
					.length,
				totalAttachments: sanitizedAttachments.length,
			},
		};

		return await InboundEmailSchema.parseAsync(emailData);
	}

	/**
	 * Parse and validate an outbound email for sending
	 * @param emailData Raw email data object
	 * @returns Validated outbound email data
	 */
	static async outboundEmail(emailData: unknown): Promise<OutboundEmail> {
		return OutboundEmailSchema.parse(emailData);
	}

	/**
	 * Parse and validate email data for spam checking
	 * @param emailData Raw email data for spam analysis
	 * @returns Validated spam check data
	 */
	static async spamCheck(emailData: unknown): Promise<SpamCheck> {
		return SpamCheckSchema.parse(emailData);
	}

	/**
	 * Extract email addresses from various formats
	 * @param addressField Email address field (string, object, or array)
	 * @returns Array of email addresses as strings
	 */
	static extractEmailAddresses(
		addressField:
			| string
			| { address?: string; text?: string }
			| Array<string | { address?: string; text?: string }>
			| null
			| undefined,
	): string[] {
		if (!addressField) return [];

		if (typeof addressField === "string") {
			return [addressField];
		}

		if (Array.isArray(addressField)) {
			return addressField
				.map((addr) =>
					typeof addr === "string" ? addr : addr.address || addr.text || "",
				)
				.filter(Boolean);
		}

		if (typeof addressField === "object") {
			return [addressField.address || addressField.text || ""].filter(Boolean);
		}

		return [];
	}

	/**
	 * Validate a single email address
	 * @param email Email address to validate
	 * @returns True if valid email format
	 */
	static isValidEmail(email: string): boolean {
		return SecurityService.validateEmail(email) !== null;
	}

	/**
	 * Sanitize email content to prevent XSS and other security issues
	 * @param content HTML or text content
	 * @returns Sanitized content
	 */
	static sanitizeContent(content: string): string {
		return SecurityService.sanitizeHtml(content).content;
	}

	/**
	 * Extract plain text from HTML content
	 * @param html HTML content
	 * @returns Plain text version
	 */
	static htmlToText(html: string): string {
		return SecurityService.stripAllHtml(html);
	}
}
