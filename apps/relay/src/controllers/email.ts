import { Elysia } from "elysia";
import { RelayModule } from "../modules";
import { EmailSenderService } from "../services/sender";
import type { EmailData, SendResult, SMTPConfig } from "../types";

// Email sending controller
export const emailController = new Elysia({
	prefix: "/send",
	name: "email-controller",
	detail: {
		tags: ["Email Sending"],
		description: "Email sending endpoints using SMTP",
	},
})
	.model({
		"email.data": RelayModule.EmailData,
		"email.smtp": RelayModule.SMTPConfig,
		"email.request": RelayModule.SendEmailRequest,
		"email.response": RelayModule.StandardResponse,
	})
	.post(
		"/",
		async ({ body }: { body: { email: EmailData; smtp?: SMTPConfig } }) => {
			try {
				const { email, smtp } = body;

				let result: SendResult;
				if (smtp) {
					// Use provided SMTP configuration
					result = await EmailSenderService.sendEmail(email, smtp);
				} else {
					// Use automatic SMTP detection
					result = await EmailSenderService.sendEmailAuto(email);
				}

				if (result.success) {
					return {
						success: true,
						messageId: result.messageId,
						accepted: result.accepted,
						rejected: result.rejected,
						message: `Email sent successfully to ${result.accepted.length} recipients`,
					};
				}

				return {
					success: false,
					error: result.error,
					rejected: result.rejected,
					message: "Failed to send email",
				};
			} catch (error) {
				return {
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
					message: "Failed to process email sending request",
				};
			}
		},
		{
			body: "email.request",
			detail: {
				summary: "Send Email",
				description:
					"Send an email using SMTP. If no SMTP config is provided, will try common providers.",
				tags: ["Email"],
			},
		},
	)
	.post(
		"/verify",
		async ({ body }) => {
			try {
				const isValid = await EmailSenderService.verifyConnection(body);
				return {
					success: true,
					valid: isValid,
					message: isValid
						? "SMTP connection is valid"
						: "SMTP connection failed",
				};
			} catch (error) {
				return {
					success: false,
					valid: false,
					error: error instanceof Error ? error.message : "Unknown error",
					message: "Failed to verify SMTP connection",
				};
			}
		},
		{
			body: "email.smtp",
			detail: {
				summary: "Verify SMTP",
				description: "Verify if an SMTP configuration is working",
				tags: ["Email"],
			},
		},
	)
	.get(
		"/stats",
		() => {
			const stats = EmailSenderService.getStats();
			return {
				success: true,
				data: stats,
				message: "Email sender statistics retrieved",
			};
		},
		{
			detail: {
				summary: "Email Sender Stats",
				description: "Get statistics about email sending service",
				tags: ["Email"],
			},
		},
	);
