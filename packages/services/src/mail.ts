import { EmailQueue } from "./queue";

type EmailAddress = string | { email: string; name?: string };

type EmailAttachment = {
	filename?: string;
	contentType?: string;
	content?: Buffer;
	size?: number;
	cid?: string;
	contentId?: string;
	checksum?: string;
	related?: boolean;
};

type SendMailOptions = {
	to: EmailAddress | EmailAddress[];
	from: EmailAddress;
	subject: string;
	text: string;
	html?: string;
	cc?: EmailAddress | EmailAddress[];
	bcc?: EmailAddress | EmailAddress[];
	replyTo?: EmailAddress;
	priority?: "normal" | "low" | "high";
	attachments?: EmailAttachment[];
	headers?: Record<string, string>;
	delay?: number;
};

type SendMailResponse = {
	success: boolean;
	message?: string;
	error?: string;
};

export abstract class Mail {
	private static readonly RELAY_API_URL =
		process.env.RELAY_API_URL || "http://localhost:4000";

	private static convertEmailAddress(address: EmailAddress) {
		if (typeof address === "string") {
			return {
				value: [{ address, name: undefined }],
				text: address,
				html: address,
			};
		}
		return {
			value: [{ address: address.email, name: address.name }],
			text: address.name ? `${address.name} <${address.email}>` : address.email,
			html: address.name
				? `${address.name} &lt;${address.email}&gt;`
				: address.email,
		};
	}

	private static convertEmailAddresses(
		addresses: EmailAddress | EmailAddress[],
	) {
		if (Array.isArray(addresses)) {
			return addresses.map((addr) => Mail.convertEmailAddress(addr));
		}
		return Mail.convertEmailAddress(addresses);
	}

	static async sendMail(
		options: SendMailOptions & { sendByMemberId?: string },
	): Promise<SendMailResponse> {
		try {
			await EmailQueue.processOutbound({
				subject: options.subject,
				text: options.text,
				html: options.html,
				to: options.to ? Mail.convertEmailAddresses(options.to) : undefined,
				from: Mail.convertEmailAddress(options.from),
				cc: options.cc ? Mail.convertEmailAddresses(options.cc) : undefined,
				bcc: options.bcc ? Mail.convertEmailAddresses(options.bcc) : undefined,
				replyTo: options.replyTo
					? Mail.convertEmailAddress(options.replyTo)
					: undefined,
				priority: options.priority,
				attachments: options.attachments || [],
				headers: options.headers || {},
				headerLines: [],
				delay: options.delay || 0,

				sendByUser: options.sendByMemberId ? false : true,
				memberId: options.sendByMemberId || undefined,
			});
			return {
				success: true,
				message: "Email queued successfully",
			};
		} catch (error) {
			console.error("Failed to send email:", error);
			return {
				success: false,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	}

	/**
	 * Send a simple text email
	 */
	static async sendSimpleEmail({
		to,
		from,
		subject,
		text,
	}: {
		to: string;
		from: string;
		subject: string;
		text: string;
	}): Promise<SendMailResponse> {
		return Mail.sendMail({ to, from, subject, text });
	}

	/**
	 * Send an HTML email
	 */
	static async sendHtmlEmail({
		to,
		from,
		subject,
		text,
		html,
	}: {
		to: string;
		from: string;
		subject: string;
		text: string;
		html: string;
	}): Promise<SendMailResponse> {
		return Mail.sendMail({ to, from, subject, text, html });
	}

	/**
	 * Send an email with attachments
	 */
	static async sendEmailWithAttachments({
		to,
		from,
		subject,
		text,
		html,
		attachments,
	}: {
		to: EmailAddress;
		from: EmailAddress;
		subject: string;
		text: string;
		html?: string;
		attachments: EmailAttachment[];
	}): Promise<SendMailResponse> {
		return Mail.sendMail({ to, from, subject, text, html, attachments });
	}
}
