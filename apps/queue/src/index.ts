import amqplib from "amqplib";

(async () => {
	const queue = "tasks";
	const EXCHANGE = "delayed-tasks";
	const conn = await amqplib.connect("amqp://admin:secret@localhost:5672");

	const ch1 = await conn.createChannel();
	await ch1.assertQueue(queue);

	await ch1.assertExchange(EXCHANGE, "x-delayed-message", {
		durable: false,
		arguments: { "x-delayed-type": "direct" },
	});

	ch1.bindQueue(queue, EXCHANGE, queue);

	// Listener
	ch1.consume(queue, (msg) => {
		if (msg !== null) {
			console.log("Received:", msg.content.toString());
			ch1.ack(msg);
		} else {
			console.log("Consumer cancelled by server");
		}
	});

	// Sender
	const ch2 = await conn.createChannel();

	for (let i = 1; i <= 5; i++) {
		ch2.publish(EXCHANGE, queue, Buffer.from("something to do"), {
			headers: { "x-delay": 1000 * i },
		});
	}
})();
