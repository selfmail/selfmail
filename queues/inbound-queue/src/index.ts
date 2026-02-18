import { Queue } from "bullmq";
import { connection } from "./connection";

export const emailQueue = new Queue("email", { connection });
