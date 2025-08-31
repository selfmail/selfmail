import type { MxRecord } from "node:dns";
import type amqplib from "amqplib";
import nodemailer from "nodemailer";
import { Logs } from "services/logs";
import type { OutboundEmail } from "../schema/outbound";
import { calculateNextDelay } from "../utils/delay";

async function retryWithDelay(
	channel: amqplib.Channel,
	msg: amqplib.ConsumeMessage,
	reason: string,
) {
	const currentDelay = Number(msg.properties.headers?.["x-delay"]) || 0;
	const nextDelay = calculateNextDelay(currentDelay);

	if (nextDelay === undefined) {
		Logs.error(
			`${reason} - Maximum retries exceeded, permanently rejecting message`,
		);
		channel.nack(msg, false, false);
		return;
	}

	Logs.log(
		`${reason} - Retrying in ${nextDelay}ms (attempt after ${currentDelay}ms delay)`,
	);

	const exchange = "email-exchange";
	const queue = "outbound-emails";

	channel.publish(exchange, queue, msg.content, {
		headers: {
			...msg.properties.headers,
			"x-delay": nextDelay,
		},
		persistent: true,
		contentType: msg.properties.contentType,
	});

	channel.ack(msg);
}

export abstract class Send {
	static async mail({
		from,
		records,
		subject,
		to,
		cc,
		bcc,
		replyTo,
		html,
		text,
		attachments,
		messageId,
		inReplyTo,
		references,
		date,
		priority,
		msg,
		channel,
	}: OutboundEmail & {
		records: MxRecord[];
		msg: amqplib.ConsumeMessage;
		channel: amqplib.Channel;
	}) {
		const host = records[0]?.exchange;

		const extractEmails = (
			addressObj:
				| {
						value: { address: string; name?: string }[];
						text: string;
						html: string;
				  }
				| {
						value: { address: string; name?: string }[];
						text: string;
						html: string;
				  }[]
				| undefined,
		): string | undefined => {
			if (!addressObj) return undefined;
			if (Array.isArray(addressObj)) {
				return addressObj
					.map((addr) => addr.value.map((v) => v.address).join(", "))
					.join(", ");
			}
			return addressObj.value?.map((v) => v.address).join(", ");
		};

		const emailData = {
			to: extractEmails(to),
			from: extractEmails(from),
			cc: extractEmails(cc),
			bcc: extractEmails(bcc),
			replyTo: extractEmails(replyTo),
			subject: subject || "",
			html: html && typeof html === "string" ? html : undefined,
			text: text || "",
		};

		Logs.log(`Preparing to send email: ${JSON.stringify(emailData)}`);

		if (!host) {
			Logs.error("No SMTP host found in MX records");
			await retryWithDelay(channel, msg, "No SMTP host found in MX records");
			return;
		}

		const transporter = nodemailer.createTransport({
			host,
			port: 25,
		});

		try {
			const verify = await transporter.verify();

			if (!verify) {
				await retryWithDelay(
					channel,
					msg,
					"SMTP connection verification failed",
				);
				return;
			}

			const send = await transporter.sendMail({
				to: emailData.to,
				from: emailData.from,
				cc: emailData.cc,
				bcc: emailData.bcc,
				replyTo: emailData.replyTo,
				subject: emailData.subject,
				html: emailData.html,
				text: emailData.text,
				attachments: attachments?.map((att) => ({
					filename: att.filename,
					content: att.content,
					contentType: att.contentType,
					cid: att.cid,
				})),
				messageId: messageId,
				inReplyTo: inReplyTo,
				references: Array.isArray(references)
					? references.join(" ")
					: references,
				date: date || new Date(),
				priority: priority || "normal",
			});

			if (!send.messageId) {
				Logs.error("Email sending failed - no messageId received");
				await retryWithDelay(
					channel,
					msg,
					"Email sending failed - no messageId received",
				);
				return;
			}

			Logs.log(`Email sent successfully: ${send.messageId}`);
			Logs.log(`Email details: ${JSON.stringify(emailData)}`);

			return send.messageId;
		} catch (error) {
			Logs.error(
				`Email sending failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			await retryWithDelay(
				channel,
				msg,
				`Email sending failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			return;
		}
	}
}
