import type amqplib from "amqplib";
import type { ParsedMail } from "mailparser";
import { Logs } from "services/logs";
import { Spam } from "services/spam";
import z from "zod/v4";
import { outboundSchema } from "../schema/outbound";
import { DNS } from "../services/dns";
import { Send } from "../services/send";
import { calculateNextDelay } from "../utils/delay";

async function retryWithDelay(
	channel: amqplib.Channel,
	msg: amqplib.ConsumeMessage,
	exchange: string,
	queue: string,
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

	// Republish with delay over the delayed exchange
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

export async function outboundListener(channel: amqplib.Channel) {
	const queue = "outbound-emails";
	const exchange = "email-exchange"; // delayed exchange

	// delayed exchange deklarieren
	await channel.assertExchange(exchange, "x-delayed-message", {
		durable: true,
		arguments: { "x-delayed-type": "direct" },
	});

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
				await retryWithDelay(
					channel,
					msg,
					exchange,
					queue,
					"Parsing outbound email failed",
				);
				return;
			}

			const mail = parse.data;

			let recipientEmail: string;
			if (mail.to) {
				if (Array.isArray(mail.to)) {
					recipientEmail = mail.to[0]?.value[0]?.address || "";
				} else {
					recipientEmail = mail.to.value[0]?.address || "";
				}
			} else {
				Logs.error("No recipient address found in email!");
				await retryWithDelay(
					channel,
					msg,
					exchange,
					queue,
					"No recipient address found",
				);
				return;
			}

			const host = recipientEmail.split("@")[1];

			if (!host) {
				Logs.error("Extracting host from email address went wrong!");
				await retryWithDelay(
					channel,
					msg,
					exchange,
					queue,
					"Failed to extract host from email address",
				);
				return;
			}

			const spamResult = await Spam.check(mail as unknown as ParsedMail);
			if (spamResult.allow === false) {
				Logs.error("Outbound email blocked due to spam!");
				await retryWithDelay(
					channel,
					msg,
					exchange,
					queue,
					"Email blocked due to spam",
				);
				return;
			}

			const mxRecords = await DNS.resolveMX(host);

			if (!mxRecords || mxRecords.length === 0) {
				Logs.error(`No MX records found for host ${host}`);
				await retryWithDelay(
					channel,
					msg,
					exchange,
					queue,
					`No MX records found for host ${host}`,
				);
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
				channel.ack(msg);
			}
		}
	});
}
