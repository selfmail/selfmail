import amqplib from "amqplib";

export interface Mail {
	id: string;
	to: string;
	from: string;
	subject: string;
	body: string;
}

const RABBIT_URL = "amqp://admin:secret@localhost:5672";
const EXCHANGE = "delayed-mail";
const QUEUE = "outgoing-mails";
const DLX = "dead-letter";

export async function initQueue() {
	const conn = await amqplib.connect(RABBIT_URL);
	const channel = await conn.createChannel();

	// Delayed Exchange
	await channel.assertExchange(EXCHANGE, "x-delayed-message", {
		durable: true,
		arguments: { "x-delayed-type": "direct" },
	});

	// Dead Letter Exchange
	await channel.assertExchange(DLX, "fanout", { durable: true });

	// Main Queue
	await channel.assertQueue(QUEUE, {
		durable: true,
		arguments: {
			"x-dead-letter-exchange": DLX,
		},
	});

	await channel.bindQueue(QUEUE, EXCHANGE, QUEUE);

	return { conn, channel };
}

export async function enqueueMail(mail: Mail, delayMs = 0) {
	const { channel } = await initQueue();
	channel.publish(EXCHANGE, QUEUE, Buffer.from(JSON.stringify(mail)), {
		headers: { "x-delay": delayMs },
		persistent: true,
	});
	console.log(`Mail queued for ${mail.to} with delay ${delayMs}ms`);
	await channel.close();
}
