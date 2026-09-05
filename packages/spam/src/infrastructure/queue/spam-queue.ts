import { Worker } from "bullmq";
import { Context, Data, Effect, Layer, Schema, type SchemaIssue } from "effect";
import { AppConfig } from "../../config";

export const IncomingSmtpJob = Schema.Struct({
  id: Schema.String,

  receivedAt: Schema.DateFromString,

  envelope: Schema.Struct({
    mailFrom: Schema.NullOr(Schema.String),

    rcptTo: Schema.Array(
      Schema.Struct({
        address: Schema.String,
      })
    ),
  }),

  connection: Schema.Struct({
    remoteAddress: Schema.String,
    helo: Schema.optional(Schema.String),

    tls: Schema.Boolean,
    authenticated: Schema.Boolean,
  }),

  rawEmail: Schema.Struct({
    storageKey: Schema.String,
    size: Schema.Number,
  }),
});

export type IncomingSmtpJob = typeof IncomingSmtpJob.Type;

export class BullMQClientError extends Data.TaggedError("BullMQClientError")<{
  readonly cause: unknown;
  readonly message: string;
}> {}

export class InvalidIncomingMailJobError extends Data.TaggedError(
  "InvalidIncomingMailJobError"
)<{
  readonly issue: SchemaIssue.Issue;
}> {}

export class BullMQ extends Context.Service<BullMQ>()("@selfmail/spam/BullMQ", {
  make: Effect.gen(function* () {
    const config = yield* AppConfig;

    return {
      listen: Effect.fn("@selfmail/spam/SpamQueueListen")(function* <E, R>(
        processor: (job: IncomingSmtpJob) => Effect.Effect<void, E, R>
      ) {
        const context = yield* Effect.context<R>();

        const worker = yield* Effect.acquireRelease(
          Effect.try({
            try: () =>
              new Worker<unknown, void>(
                config.spamQueueName,
                (job) => {
                  const program = Effect.gen(function* () {
                    const parsed = yield* Schema.decodeUnknownEffect(
                      IncomingSmtpJob
                    )(job.data).pipe(
                      Effect.mapError(
                        (error) =>
                          new InvalidIncomingMailJobError({
                            issue: error.issue,
                          })
                      )
                    );

                    yield* processor(parsed);
                  }).pipe(
                    Effect.tapError((error) =>
                      Effect.logError("Spam queue job failed").pipe(
                        Effect.annotateLogs({
                          jobId: job.id,
                          queue: config.spamQueueName,
                          error,
                        })
                      )
                    ),
                    Effect.provide(context)
                  );

                  return Effect.runPromise(program);
                },
                {
                  concurrency: config.spamQueueConcurrency,

                  connection: {
                    url: config.redisUrl,
                    maxRetriesPerRequest: null,
                  },
                }
              ),

            catch: (cause) =>
              new BullMQClientError({
                cause,
                message: "Failed to create the spam queue worker",
              }),
          }),

          (worker) => Effect.promise(() => worker.close())
        );

        const workerError = Effect.callback<never, BullMQClientError>(
          (resume) => {
            const onError = (cause: Error) => {
              resume(
                Effect.fail(
                  new BullMQClientError({
                    cause,
                    message: "The spam queue worker failed",
                  })
                )
              );
            };

            worker.once("error", onError);

            return Effect.sync(() => {
              worker.off("error", onError);
            });
          }
        );

        yield* Effect.raceFirst(
          workerError,

          Effect.tryPromise({
            try: () => worker.waitUntilReady(),

            catch: (cause) =>
              new BullMQClientError({
                cause,
                message: "Failed to connect the spam queue worker",
              }),
          }).pipe(Effect.andThen(Effect.never))
        );
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
