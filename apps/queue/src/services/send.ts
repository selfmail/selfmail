import type { MxRecord } from "node:dns";
import type amqplib from "amqplib";
import nodemailer from "nodemailer";
import { Logs } from "services/logs";
import type { OutboundEmail } from "../schema/outbound";

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

		// Helper function to extract email addresses from AddressObject
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
			channel.nack(msg, false, false);
			return;
		}

		const transporter = nodemailer.createTransport({
			host,
			port: 25,
		});

		const verify = await transporter.verify();

		if (!verify) {
			channel.nack(msg, false, false);
			return;
		}

		try {
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
				// Additional email headers
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
				channel.nack(msg, false, false);
				return;
			}

			Logs.log(`Email sent successfully: ${send.messageId}`);
			Logs.log(`Email details: ${JSON.stringify(emailData)}`);

			// Acknowledge successful processing
			channel.ack(msg);
			return send.messageId;
		} catch (error) {
			Logs.error(
				`Email sending failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			channel.nack(msg, false, false);
			return;
		}
	}
}
