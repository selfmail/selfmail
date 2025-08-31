import amqlib from "amqplib";
import type { ParsedMail } from "mailparser";
import { Logs } from "./logs";

export abstract class Queue {
	static async retreiveChannel() {
		const exchange = "email-queue";

		const conn = await amqlib.connect("amqp://admin:secret@localhost:5672");
		const channel = await conn.createChannel();

		await channel.assertExchange(exchange, "direct", {
			durable: true,
		});

		return channel;
	}
	static async processOutbound({
		delay = 0,

		...mail
	}: ParsedMail & {
		delay?: number;
	}) {
		const channel = await Queue.retreiveChannel();

		channel.publish(
			"email-queue",
			"outbound-emails",
			Buffer.from(JSON.stringify(mail)),
			{
				headers: {
					"x-delay": delay,
				},
			},
		);

		Logs.log("Add new email to outbound-queue!");
	}
}
