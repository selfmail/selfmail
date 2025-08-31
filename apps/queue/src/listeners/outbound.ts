import type amqplib from "amqplib";
import { Logs } from "services/logs";
import { Spam } from "services/spam";
import { outboundSchema } from "../schema/outbound";
import { DNS } from "../services/dns";
import { Send } from "../services/send";

export async function outboundListener(channel: amqplib.Channel) {
	const queue = "outbound-emails";
	const exchange = "email-queue";

	await channel.assertQueue(queue, { durable: true });
	await channel.bindQueue(queue, exchange, queue);
	await channel.prefetch(5);

	// Send emails with delay
	channel.consume(queue, async (msg) => {
		if (msg) {
			Logs.log("Received outbound email to send.");
			const parse = await outboundSchema.safeParseAsync(
				JSON.parse(msg.content.toString()),
			);

			if (!parse.success) {
				Logs.error("Parsing outbound email went wrong!");
				channel.nack(msg, false, false);
				return;
			}

			const mail = parse.data;

			const host = mail.to.split("@")[1];

			if (!host) {
				Logs.error("Extracting host from email address went wrong!");
				channel.nack(msg, false, false);
				return;
			}

			// Check for Spam
			const spamResult = await Spam.check(mail);
			if (!spamResult.allow) {
				Logs.error(`Outbound email blocked: ${spamResult.warning}`);
				channel.nack(msg, false, false);
				return;
			}

			const mxRecords = await DNS.resolveMX(host);

			if (!mxRecords || mxRecords.length === 0) {
				Logs.error(`No MX records found for host ${host}`);
				channel.nack(msg, false, false);
				return;
			}

			await Send.mail({
				records: mxRecords,

				from: mail.from,
				to: mail.to,
				subject: mail.subject,
				text: mail.body,
				html: mail.html,
			});

			Logs.log(`Sent outbound email: ${mail.subject}`);
			channel.ack(msg);
		}
	});
}
