import type amqplib from "amqplib";
import type { ParsedMail } from "mailparser";
import { Logs } from "services/logs";
import { Spam } from "services/spam";
import z from "zod/v4";
import { outboundSchema } from "../schema/outbound";
import { DNS } from "../services/dns";
import { Send } from "../services/send";

export async function outboundListener(channel: amqplib.Channel) {
	const queue = "outbound-emails";
	const exchange = "email-queue";

	await channel.assertQueue(queue, { durable: true });
	await channel.bindQueue(queue, exchange, queue);
	await channel.prefetch(5);

	channel.consume(queue, async (msg) => {
		if (msg) {
			Logs.log("Received outbound email to send.");
			const parse = await outboundSchema.safeParseAsync(
				JSON.parse(msg.content.toString()),
			);

			if (!parse.success) {
				console.error(z.prettifyError(parse.error));
				Logs.error("Parsing outbound email went wrong!");
				channel.nack(msg, false, false);
				return;
			}

			const mail = parse.data;

			// Extract recipient email address - handle both single and array formats
			let recipientEmail: string;
			if (mail.to) {
				if (Array.isArray(mail.to)) {
					recipientEmail = mail.to[0]?.value[0]?.address || "";
				} else {
					recipientEmail = mail.to.value[0]?.address || "";
				}
			} else {
				Logs.error("No recipient address found in email!");
				channel.nack(msg, false, false);
				return;
			}

			const host = recipientEmail.split("@")[1];

			if (!host) {
				Logs.error("Extracting host from email address went wrong!");
				channel.nack(msg, false, false);
				return;
			}

			const spamResult = await Spam.check(mail as unknown as ParsedMail);
			if (spamResult.allow === false) {
				Logs.error("Outbound email blocked due to spam!");
				channel.nack(msg, false, false);
				return;
			}

			const mxRecords = await DNS.resolveMX(host);

			if (!mxRecords || mxRecords.length === 0) {
				Logs.error(`No MX records found for host ${host}`);
				channel.nack(msg, false, false);
				return;
			}

			const messageId = await Send.mail({
				...mail,
				records: mxRecords,
				msg,
				channel,
			});

			if (messageId) {
				Logs.log(
					`Sent outbound email: ${mail.subject} (Message ID: ${messageId})`,
				);
			}
		}
	});
}
