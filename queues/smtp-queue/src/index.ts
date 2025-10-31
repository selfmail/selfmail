import { Queue } from "bullmq";
import { connection } from "./connection";

// biome-ignore lint/suspicious/noExplicitAny: ioredis version mismatch between bullmq dependencies
export const emailQueue = new Queue("email", { connection } as any);
