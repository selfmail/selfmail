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
	const ch = await conn.createChannel();

	// Delayed Exchange
	await ch.assertExchange(EXCHANGE, "x-delayed-message", {
		durable: true,
		arguments: { "x-delayed-type": "direct" },
	});

	// Dead Letter Exchange
	await ch.assertExchange(DLX, "fanout", { durable: true });

	// Main Queue
	await ch.assertQueue(QUEUE, {
		durable: true,
		arguments: {
			"x-dead-letter-exchange": DLX,
		},
	});

	await ch.bindQueue(QUEUE, EXCHANGE, QUEUE);

	return { conn, ch };
}

export async function enqueueMail(mail: Mail, delayMs = 0) {
	const { ch } = await initQueue();
	ch.publish(EXCHANGE, QUEUE, Buffer.from(JSON.stringify(mail)), {
		headers: { "x-delay": delayMs },
		persistent: true,
	});
	console.log(`Mail queued for ${mail.to} with delay ${delayMs}ms`);
	await ch.close();
}
