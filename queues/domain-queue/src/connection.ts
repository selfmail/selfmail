import { RedisClient } from "bun";

export const connection = new RedisClient("redis://localhost:6379");
