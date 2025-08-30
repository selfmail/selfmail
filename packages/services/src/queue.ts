import amqlib from "amqplib";

export abstract class Queue {
	static async retreiveChannel() {
		const exchange = "email";

		const conn = await amqlib.connect("amqp://admin:secret@localhost:5672");
		const channel = await conn.createChannel();

		await channel.assertExchange(exchange, "direct", {
			durable: true,
		});

		return channel;
	}
	static async processOutbound({
		subject,
		to,
		from,
		body,
		html,

		delay = 0,
	}: {
		subject: string;
		to: string;
		from: string;
		body: string;
		html: string | undefined;

		delay?: number;
	}) {
		const channel = await Queue.retreiveChannel();

		channel.publish(
			"email-queue",
			"outbound-emails",
			Buffer.from(
				JSON.stringify({
					subject,
					to,
					from,
					body,
					html,

					attachments: [],
				}),
			),
			{
				headers: {
					"x-delay": delay,
				},
			},
		);
	}
}
