import amqlib from "amqplib";
import { Logs } from "services/logs";
import { inboundListener } from "./listeners/inbound";
import { outboundListener } from "./listeners/outbound";

const exchange = "email-queue";

const conn = await amqlib.connect("amqp://admin:secret@localhost:5672");
const channel = await conn.createChannel();

await channel.assertExchange(exchange, "direct", { durable: true });

await inboundListener(channel);
await outboundListener(channel);

Logs.log("Inbound and Outbound Queue are listening!");

process.on("SIGINT", async () => {
	await channel.close();
	await conn.close();

	process.exit();
});
