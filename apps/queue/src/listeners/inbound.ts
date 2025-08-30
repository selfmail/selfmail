import type amqplib from "amqplib";

export async function inboundListener(channel: amqplib.Channel) {
	const queue = "inbound-emails";
	const exchange = "email-queue";

	await channel.assertQueue(queue, { durable: true });
	await channel.bindQueue(queue, exchange, queue);

	channel.consume(queue, (msg) => {
		if (msg) {
			const mail = JSON.parse(msg.content.toString());
			console.log("Received inbound email:", mail);
			channel.ack(msg);
		}
	});

	channel.publish(
		exchange,
		queue,
		Buffer.from(JSON.stringify({ subject: "Test inbound email" })),
	);
}
