import { Queue } from "bullmq";
import IORedis from "ioredis";
import { z } from "zod";
import { Logs } from "./logs";

export abstract class Transactional {
	private static connection = new IORedis(
		process.env.REDIS_URL || "redis://localhost:6379",
		{
			maxRetriesPerRequest: null,
		},
	);

	private static queue = new Queue<z.infer<typeof Transactional.schema>>(
		"transactional-outbound",
		{
			connection: Transactional.connection,
			defaultJobOptions: {
				attempts: 5,
				removeOnComplete: true,
				removeOnFail: false,
			},
		},
	);

	private static async processOutbound(
		data: z.infer<typeof Transactional.schema> & { delay?: number },
	) {
		await Transactional.queue.add("transactional-outbound", data, {
			delay: data.delay,
		});
	}

	private static schema = z.object({
		to: z.string().email(),
		from: z.string().email(),
		subject: z.string().min(1).max(255),
		text: z.string().min(1),
		html: z.string().min(1),
	});

	static async send(params: {
		to: string;
		subject: string;
		text: string;
		html: string;
	}) {
		// parse the provided values
		const { success, data, error } = await Transactional.schema.safeParseAsync({
			...params,
			from:
				process.env.TRANSACTIONAL_EMAIL_FROM ||
				"noreply@transactional.selfmail.app",
		});

		if (!success) {
			await Logs.error(
				`Failed to parse transactional parameter for recipient ${params.to}: ${JSON.stringify(error.issues)}\nParams: ${JSON.stringify(params)}`,
			);

			throw new Error("Invalid parameters for transactional email");
		}

		// send the email
		await Transactional.processOutbound(data);
	}
}
