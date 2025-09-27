import { Queue } from "bullmq";
import IORedis from "ioredis";
import { z } from "zod/v4";
import { Logs } from "./logs";

export abstract class Transactional {
	static connection = new IORedis(
		process.env.REDIS_URL || "redis://localhost:6379",
		{
			maxRetriesPerRequest: null,
		},
	);

	static queue = new Queue<z.infer<typeof Transactional.schema>>(
		"emails-outbound",
		{
			connection: Transactional.connection,
			defaultJobOptions: {
				attempts: 5,
				backoff: {
					type: "exponential",
					delay: 1000,
				},
				removeOnComplete: true,
				removeOnFail: false,
			},
		},
	);

	static async processOutbound(
		data: z.infer<typeof Transactional.schema> & { delay?: number },
	) {
		await Transactional.queue.add("transactional-outbound", data, {
			delay: data.delay,
		});
	}

	static schema = z.object({
		to: z.email(),
		from: z.email(),
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
			from: process.env.TRANSACTIONAL_EMAIL_FROM,
		});

		if (!success) {
			await Logs.error(
				`Failed to parse transactional parameter for recipient ${params.to}: ${JSON.stringify(z.prettifyError(error))}\nParams: ${JSON.stringify(params)}`,
			);

			throw new Error("Invalid parameters for transactional email");
		}

		// send the email
		await Transactional.processOutbound(data);
	}
}
