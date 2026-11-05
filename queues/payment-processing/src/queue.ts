import { Queue } from "bullmq";
import { Effect } from "effect";
import { connection } from "./connection";
import {
  getWebhookSecret,
  type PaymentJobData,
  parsePaymentEvent,
} from "./event";

const queue = new Queue<PaymentJobData>("payment-processing", {
  connection,
});

export const addPaymentToQueue = async (payload: string, signature: string) => {
  const data: PaymentJobData = { payload, signature, receivedAt: Date.now() };
  const event = await Effect.runPromise(
    parsePaymentEvent(data, getWebhookSecret())
  );

  await queue.add("process-payment", data, {
    jobId: event.id,
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { age: 86_400 },
    removeOnFail: false,
  });
};
