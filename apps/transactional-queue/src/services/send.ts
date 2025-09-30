import type { MxRecord } from "node:dns";
import consola from "consola";
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
				continue;
			}

			const transporter = nodemailer.createTransport({
				host,
				port: 25,
				secure: false,
			});

			const verify = await transporter.verify();

			if (!verify) {
				consola.warn(`Could not verify connection to mail server ${host}`);
				continue;
			}

			const send = await transporter.sendMail({
				to: to,
				name: "mail.selfmail.app",
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
				consola.error("Failed to send email, no messageId returned");
				throw new Error("Failed to send email, no messageId returned");
			}

			return send.messageId;
		}
	}
}
