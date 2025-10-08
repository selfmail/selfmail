import IORedis from "ioredis";

export const connection = new IORedis(
	process.env.REDIS_URL ?? "redis://localhost:6379",
	{
		maxRetriesPerRequest: null,
	},
);
