import { type Job, UnrecoverableError, Worker } from "bullmq";
import { Effect } from "effect";
import { connection } from "./connection";
import { getWebhookSecret, parsePaymentEvent } from "./event";
import { handlePaymentEvent } from "./handle-event";

const webhookSecret = getWebhookSecret();

new Worker(
  "payment-processing",
  async (job: Job<unknown>) => {
    const program = parsePaymentEvent(job.data, webhookSecret).pipe(
      Effect.flatMap(handlePaymentEvent),
      Effect.tapCause((cause) =>
        Effect.logError("Payment job failed", { jobId: job.id, cause })
      )
    );

    return await Effect.runPromise(
      program.pipe(
        Effect.match({
          onFailure: (error) => {
            throw error instanceof UnrecoverableError
              ? error
              : new UnrecoverableError("Invalid payment job payload");
          },
          onSuccess: (value) => value,
        })
      )
    );
  },
  { connection }
);
