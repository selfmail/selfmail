type EmailAddress = string | { email: string; name?: string };

type EmailAttachment = {
	filename?: string;
	contentType?: string;
	content: string; // Base64 or plain text
	encoding?: "base64" | "utf8";
	size?: number;
	cid?: string;
	contentId?: string;
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

	static async sendMail(options: SendMailOptions): Promise<SendMailResponse> {
		try {
			const response = await fetch(`${Mail.RELAY_API_URL}/send`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(options),
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const result = (await response.json()) as SendMailResponse;
			return result;
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

	/**
	 * Send a transactional email (useful for system notifications)
	 */
	static async sendTransactionalEmail({
		to,
		subject,
		text,
		html,
		priority = "high",
	}: {
		to: EmailAddress;
		subject: string;
		text: string;
		html?: string;
		priority?: "normal" | "low" | "high";
	}): Promise<SendMailResponse> {
		const from = process.env.TRANSACTIONAL_EMAIL_FROM || "noreply@selfmail.app";
		return Mail.sendMail({ to, from, subject, text, html, priority });
	}
}
