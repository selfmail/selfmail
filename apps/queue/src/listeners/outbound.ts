import type amqplib from "amqplib";
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
			console.log("Receiving outbound email:", msg.content.toString());
			const parse = await outboundSchema.safeParseAsync(
				JSON.parse(msg.content.toString()),
			);

			if (!parse.success) {
				console.log("Parse went wrong!");
				channel.nack(msg, false, false);
				return;
			}

			const mail = parse.data;

			const host = mail.to.split("@")[1];

			if (!host) {
				channel.nack(msg, false, false);
				return;
			}

			const mxRecords = await DNS.resolveMX(host);

			if (!mxRecords || mxRecords.length === 0) {
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

			console.log("Received outbound email:", mail);
			channel.ack(msg);
		}
	});

	channel.publish(
		exchange,
		queue,
		Buffer.from(JSON.stringify({ subject: "Test inbound email" })),
	);
}
