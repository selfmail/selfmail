import IORedis from "ioredis";

export const connection = new IORedis({
	maxRetriesPerRequest: null,
	host: "127.0.0.1",
	port: 6379,
});
