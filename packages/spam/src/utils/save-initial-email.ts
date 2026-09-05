import { Effect } from "effect";
import type { IncomingSmtpJob } from "../infrastructure/queue/spam-queue";

export const save = Effect.fn("@selfmail/spam/saveInitialRawEmail")(function* (
  data: IncomingSmtpJob
) {
  yield* Effect.log(`Data saved with ${JSON.stringify(data)}`);
});
