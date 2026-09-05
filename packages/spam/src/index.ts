import { BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";
import { BullMQ } from "./infrastructure/queue/spam-queue";
import { save } from "./utils/save-initial-email";

const program = Effect.gen(function* () {
  const spamQueue = yield* BullMQ;

  yield* Effect.logInfo("Listening for spam queue jobs");

  yield* spamQueue.listen((job) =>
    Effect.gen(function* () {
      yield* Effect.log("Processing spam queue job", { job });
      yield* save(job);
    })
  );
}).pipe(Effect.provide(BullMQ.layer), Effect.scoped);

BunRuntime.runMain(program);
