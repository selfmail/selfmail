import type { MxRecord } from "node:dns";
import { UnrecoverableError } from "bullmq";
import { $ } from "bun";
import consola from "consola";
import nodemailer from "nodemailer";
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
	}: OutboundEmail & {
		records: MxRecord[];
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

		if (!host) {
			throw new Error("No MX records found for domain");
		}

		const dkimPrivateKey = await Bun.file("../../keys/dkim-private.pem").text();

		if (!dkimPrivateKey) {
			throw new UnrecoverableError("No DKIM private key found");
		}

		const transporter = nodemailer.createTransport({
			host,
			name: "mail.selfmail.app",
			port: 25,
			secure: false,
			dkim: {
				domainName: "selfmail.app",
				keySelector: "default",
				privateKey: dkimPrivateKey,
				headerFieldNames: "from:to:subject:date:message-id",
			},
		});

		const verify = await transporter.verify();

		if (!verify) {
			consola.error("Failed to verify transporter");
			throw new Error("Failed to verify transporter");
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
			references: Array.isArray(references) ? references.join(" ") : references,
			date: date || new Date(),
			priority: priority || "normal",
		});

		if (!send.messageId) {
			throw new Error("Failed to send email, no messageId returned");
		}

		return send.messageId;
	}
}
