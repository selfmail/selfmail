import IORedis from "ioredis";

export const connection = new IORedis("redis://localhost:6379", {
  maxRetriesPerRequest: null,
});
