import nodemailer from "nodemailer";
import type { EmailData, SendResult, SMTPConfig } from "../types";

// Email sending service using Nodemailer
export abstract class EmailSenderService {
	private static transporters = new Map<string, nodemailer.Transporter>();

	/**
	 * Create or get a cached SMTP transporter
	 */
	private static getTransporter(config: SMTPConfig): nodemailer.Transporter {
		const key = `${config.host}:${config.port}`;

		if (!EmailSenderService.transporters.has(key)) {
			const transporter = nodemailer.createTransport({
				host: config.host,
				port: config.port,
				secure: config.secure,
				auth: config.auth,
				tls: config.tls,
				pool: true, // Use connection pooling for better performance
				maxConnections: 5,
				maxMessages: 100,
				rateLimit: 10, // Max 10 messages per second
			});

			EmailSenderService.transporters.set(key, transporter);
		}

		const transporter = EmailSenderService.transporters.get(key);
		if (!transporter) {
			throw new Error(`Failed to create transporter for ${key}`);
		}
		return transporter;
	}

	/**
	 * Send email through specified SMTP server
	 */
	static async sendEmail(
		emailData: EmailData,
		smtpConfig: SMTPConfig,
	): Promise<SendResult> {
		try {
			const transporter = EmailSenderService.getTransporter(smtpConfig);

			// Prepare mail options
			const mailOptions = {
				from: emailData.from,
				to: emailData.to,
				cc: emailData.cc,
				bcc: emailData.bcc,
				subject: emailData.subject,
				text: emailData.text,
				html: emailData.html,
				attachments: emailData.attachments?.map((att) => ({
					filename: att.filename,
					content: Buffer.from(att.content, "base64"),
					contentType: att.contentType,
					cid: att.cid,
				})),
			};

			const info = await transporter.sendMail(mailOptions);

			return {
				success: true,
				messageId: info.messageId,
				accepted: info.accepted as string[],
				rejected: info.rejected as string[],
			};
		} catch (error) {
			return {
				success: false,
				accepted: [],
				rejected: emailData.to,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	}

	/**
	 * Send email with automatic SMTP configuration
	 */
	static async sendEmailAuto(
		emailData: EmailData,
		fallbackConfig?: SMTPConfig,
	): Promise<SendResult> {
		// Try common email providers first
		const providers = [
			// Gmail
			{
				host: "smtp.gmail.com",
				port: 587,
				secure: false,
				auth:
					process.env.GMAIL_USER && process.env.GMAIL_PASS
						? {
								user: process.env.GMAIL_USER,
								pass: process.env.GMAIL_PASS,
							}
						: undefined,
			},
			// Outlook
			{
				host: "smtp-mail.outlook.com",
				port: 587,
				secure: false,
				auth:
					process.env.OUTLOOK_USER && process.env.OUTLOOK_PASS
						? {
								user: process.env.OUTLOOK_USER,
								pass: process.env.OUTLOOK_PASS,
							}
						: undefined,
			},
			// Generic SMTP
			fallbackConfig,
		].filter(Boolean) as SMTPConfig[];

		for (const config of providers) {
			if (!config.auth) continue; // Skip if no auth configured

			const result = await EmailSenderService.sendEmail(emailData, config);
			if (result.success) {
				return result;
			}
		}

		return {
			success: false,
			accepted: [],
			rejected: emailData.to,
			error: "No working SMTP configuration found",
		};
	}

	/**
	 * Verify SMTP connection
	 */
	static async verifyConnection(config: SMTPConfig): Promise<boolean> {
		try {
			const transporter = EmailSenderService.getTransporter(config);
			await transporter.verify();
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Close all transporter connections
	 */
	static async closeConnections(): Promise<void> {
		const closePromises = Array.from(
			EmailSenderService.transporters.values(),
		).map((transporter) => transporter.close());

		await Promise.allSettled(closePromises);
		EmailSenderService.transporters.clear();
	}

	/**
	 * Get sender statistics
	 */
	static getStats() {
		return {
			activeTransporters: EmailSenderService.transporters.size,
			transporterHosts: Array.from(EmailSenderService.transporters.keys()),
		};
	}
}
