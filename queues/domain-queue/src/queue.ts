import { Queue } from "bullmq";
import { connection } from "./connection";

const queue = new Queue("domain-queue", {
  connection,
});
export const addDomainToQueue = async (domainId: string) => {
  await queue.add(
    "check-domain",
    { domainId },
    { removeOnComplete: true, removeOnFail: true }
  );
};
