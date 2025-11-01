import { db } from "database";
import type { ParsedMail } from "mailparser";
import { simpleParser } from "mailparser";
import { createEmail } from "outbound-queue";
import type { SMTPServerDataStream, SMTPServerSession } from "smtp-server";
import type { Callback } from "../types";

export abstract class Data {
	static async init(
		stream: SMTPServerDataStream,
		session: SMTPServerSession,
		callback: Callback,
	): Promise<ReturnType<Callback>> {
		try {
			const s = stream.on("end", () => {
				if (s.sizeExceeded) {
					console.error("Message too large.");

					const err = Object.assign(new Error("Message too large"), {
						responseCode: 552,
					});

					throw callback(err);
				}
			});

			const parsed = await simpleParser(s);

			const recipients = session.envelope.rcptTo.map((rcpt) => rcpt.address);

			if (recipients.length === 0) {
				return callback(new Error("No recipients specified"));
			}

			const { bccAddresses, ccAddresses } = Data.parseBccAndCcAddresses(parsed);

			for await (const recipientEmail of [...bccAddresses, ...ccAddresses]) {
				const address = await db.address.findUnique({
					where: {
						email: recipientEmail,
					},
				});

				if (!address) {
					console.warn(`Recipient address not found: ${recipientEmail}`);
				}
			}

			await createEmail({
				subject: parsed.subject,
				text: parsed.text,
				html: parsed.html,
				to: parsed.to as unknown as never,
				from: parsed.from as unknown as never,
				cc: parsed.cc as unknown as never,
				bcc: parsed.bcc as unknown as never,
				replyTo: parsed.replyTo as unknown as never,
				messageId: parsed.messageId,
				inReplyTo: parsed.inReplyTo,
				references: parsed.references,
				date: parsed.date?.toISOString(),
				priority: parsed.priority as "normal" | "low" | "high" | undefined,
				textAsHtml: parsed.textAsHtml,
				attachments: parsed.attachments as unknown as never,
				headers: parsed.headers as unknown as never,
				headerLines: [...parsed.headerLines] as unknown as never,
			});

			return callback();
		} catch (error) {
			console.error("Error in DATA handler:", error);
			return callback(new Error("Temporary server error"));
		}
	}

	static parseBccAndCcAddresses(parsed: ParsedMail): {
		bccAddresses: string[];
		ccAddresses: string[];
	} {
		const bccAddresses: string[] = [];
		const ccAddresses: string[] = [];

		if (parsed.bcc) {
			const bccList = Array.isArray(parsed.bcc) ? parsed.bcc : [parsed.bcc];
			for (const bcc of bccList) {
				if (bcc.value) {
					bccAddresses.push(
						...bcc.value
							.map((addr) => addr.address)
							.filter((a): a is string => !!a),
					);
				}
			}
		}

		if (parsed.cc) {
			const ccList = Array.isArray(parsed.cc) ? parsed.cc : [parsed.cc];
			for (const cc of ccList) {
				if (cc.value) {
					ccAddresses.push(
						...cc.value
							.map((addr) => addr.address)
							.filter((a): a is string => !!a),
					);
				}
			}
		}

		return { bccAddresses, ccAddresses };
	}
}
