import type { MxRecord } from "node:dns";
import nodemailer from "nodemailer";
import type { OutboundEmail } from "../schema/outbound";

export abstract class Send {
	static async mail({
		from,
		records,
		subject,
		to,
		html,
		text,
		attachments,
	}: OutboundEmail & {
		records: MxRecord[];
	}) {
		for await (const record of records) {
			const host = record.exchange;

			if (!host) {
				continue
			}

			const transporter = nodemailer.createTransport({
				host,
				port: 25,
				secure: false,
			});

			const verify = await transporter.verify();

			if (!verify) {
				continue;
			}

			const send = await transporter.sendMail({
				to: to,
				from: from,
				subject: subject,
				html: html,
				text: text,
				attachments: attachments?.map((att) => ({
					filename: att.filename,
					content: att.content,
					contentType: att.contentType,
				})),
			});

			if (!send.messageId) {
				throw new Error("Failed to send email, no messageId returned");
			}

			return send.messageId;
		}
	}
}
