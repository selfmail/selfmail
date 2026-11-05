# Effect for a robust Selfmail

A compact, hands-on guide: describe operations with Effect, bound their resource use,
and keep durable delivery guarantees in the database and job queue.

## 1. Pick the right version first

Selfmail currently declares Effect 3 in `smtp/inbound`, Effect 4 release candidates
in several packages (including `queues/domain-queue`), and Effect 4 in payments.
The examples below target **Effect 4** and were checked against the locally installed
`4.0.0-rc.117`. They are tutorial examples, not changes to the mail pipeline.
Do not pass Effect values, contexts, or layers across incompatible versions. Check
the owning package before copying code; align versions as a separate migration.

For a sandbox outside this repository:

```sh
mkdir effect-lab
cd effect-lab
bun init -y
bun add effect@4.0.0-rc.117
# Save an example as index.ts, then:
bun run index.ts
```

Inside Selfmail, use the owning workspace's dependency. No dependency changes are
needed to read this guide. See the [Effect 4 documentation](https://effect.website/docs/v4/getting-started).

## 2. Learn the three types

`Effect.Effect<A, E, R>` describes a computation:

| Type | Meaning | Selfmail example |
| --- | --- | --- |
| `A` | Success value | Stored email ID |
| `E` | Expected, typed failure | DNS unavailable, rejected payload |
| `R` | Required services | Database, object store, configuration |

An Effect is lazy: constructing it does not run it. `yield*` composes operations
inside `Effect.gen`; `.pipe(...)` adds policies. Run it at an application boundary
(HTTP handler, BullMQ processor, CLI), rather than calling `runPromise` throughout
business logic.

```ts
import { Data, Effect } from "effect";

class LookupError extends Data.TaggedError("LookupError")<{
  readonly cause: unknown;
}> {}

const lookup = (hostname: string) =>
  Effect.tryPromise({
    try: () => import("node:dns/promises").then((dns) => dns.resolveMx(hostname)),
    catch: (cause) => new LookupError({ cause }),
  });

const program = Effect.gen(function* () {
  const records = yield* lookup("example.com");
  return records.map((record) => record.exchange);
});

// Run only when ready to perform the lookup.
console.log(await Effect.runPromise(program));
```

Use `Effect.sync` for synchronous code that cannot fail, `Effect.try` for throwing
synchronous APIs, and `Effect.tryPromise` for rejecting Promise APIs. Create the
Promise **inside** `try`, so retries create a fresh operation.

Expected failures belong in `E`; unexpected exceptions are defects. Handle known
errors with `Effect.catchTag`. Do not turn every failure into `Effect.succeed`, or a
queue will acknowledge work that never happened. Defects should surface and alert.

## 3. Add deadlines and selective retries

This standalone example retries only network failures and transient HTTP responses.
It reads the response inside the abortable operation so the deadline covers the body.

```ts
import { Data, Effect, Schedule } from "effect";

class ProbeError extends Data.TaggedError("ProbeError")<{
  readonly retryable: boolean;
  readonly status?: number;
}> {}

const probe = (url: string) =>
  Effect.tryPromise({
    try: async (signal) => {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        await response.body?.cancel();
        throw new ProbeError({
          status: response.status,
          retryable: response.status === 429 || response.status >= 500,
        });
      }
      return await response.text();
    },
    catch: (cause) =>
      cause instanceof ProbeError ? cause : new ProbeError({ retryable: true }),
  }).pipe(
    Effect.timeout("2 seconds"),
    Effect.retry({
      times: 2,
      while: (error) => error._tag === "ProbeError" && error.retryable,
      schedule: Schedule.exponential("100 millis").pipe(Schedule.jittered),
    }),
    Effect.timeout("7 seconds")
  );

// Supply a trusted, configured URL; do not fetch arbitrary user URLs.
```

`times: 2` means up to three executions. The inner timeout limits an attempt; the
outer one limits the complete operation. Here a timeout stops retries because the
predicate only accepts `ProbeError`. Choose that policy deliberately. Honor provider
`Retry-After` headers when applicable. See [retry options](https://effect.website/docs/v4/error-management/retrying).

Interruption cannot undo a database commit or email already sent. Pass the supplied
AbortSignal to APIs that support cancellation; other Promise operations can continue
in the background. A deadline is not proof that a side effect did not happen.

## 4. Use Effect Queue for local backpressure

An Effect Queue coordinates fibers **inside one process**. This complete example
starts two consumers, bounds waiting work, and joins both consumers before exiting.

```ts
import { Effect, Fiber, Queue } from "effect";

interface ScanJob {
  readonly emailId: string;
}

type Work = ScanJob | "stop";

const program = Effect.scoped(
  Effect.gen(function* () {
    const queue = yield* Effect.acquireRelease(
      Queue.bounded<Work>(16),
      (queue) => Queue.shutdown(queue)
    );

    const consume = Effect.gen(function* () {
      while (true) {
        const job = yield* Queue.take(queue);
        if (job === "stop") return;
        yield* Effect.logInfo("Scanning email", { emailId: job.emailId });
      }
    });

    const workers = yield* Effect.forEach([0, 1], () =>
      Effect.forkScoped(consume)
    );

    yield* Effect.forEach(["email-1", "email-2", "email-3"], (emailId) =>
      Queue.offer(queue, { emailId })
    );
    yield* Effect.forEach(workers, () => Queue.offer(queue, "stop"));
    yield* Effect.forEach(workers, (worker) => Fiber.join(worker));
  })
);

await Effect.runPromise(program);
```

When full, `Queue.offer` waits; when empty, `Queue.take` waits. Consumers must start
before a producer fills the queue. Scoped fibers stop when their scope closes;
shutdown releases blocked queue operations. Shutdown is **not** a drain: this example
uses FIFO stop messages and joins to finish queued work first. A production pool must
also supervise consumer failure and stop/unblock producers if consumers die.

Use bounded queues for transient work that can be recreated from durable state.
Avoid dropping/sliding queues for mail delivery. A taken item has no durable ack,
retry, or crash recovery, and all items disappear on process loss. See
[Effect Queue](https://effect.website/docs/v4/concurrency/queue).

## 5. Keep BullMQ for durable jobs; use Effect inside the processor

Selfmail already uses BullMQ. Let it own delayed retries and stalled-job recovery;
let Effect own validation, deadlines, dependency access, and operation composition.
The following is an **integration sketch**: `validateAndProcess` is your application's
Effect program, supplied with its live services before running.

```ts
import { Effect } from "effect";
import { UnrecoverableError, Worker } from "bullmq";

interface InvalidJob {
  readonly _tag: "InvalidJob";
}

interface ProcessingError {
  readonly _tag: "ProcessingError";
}

interface StoredJob {
  readonly emailId: string;
}

declare const validateAndProcess: (
  raw: unknown
) => Effect.Effect<void, InvalidJob | ProcessingError>;

const worker = new Worker<StoredJob>(
  "email-processing",
  async (job) => {
    await Effect.runPromise(
      validateAndProcess(job.data).pipe(
        Effect.catchTag("InvalidJob", () =>
          Effect.fail(new UnrecoverableError("Invalid email job"))
        )
      )
    );
  },
  { connection: { host: "127.0.0.1", port: 6379 }, concurrency: 8 }
);

worker.on("error", () => {
  // Replace with the application's structured logger and alerting.
  console.error("Email worker infrastructure error");
});
```

Use the environment's existing Redis connection configuration in real code. Rejected
`runPromise` calls fail the job. Invalid payloads stop retrying; transient errors
remain retryable. Configure the producer, for example:

```ts
// queue is an existing BullMQ Queue; id is a stable internal operation ID.
await queue.add("process", { emailId: id }, {
  jobId: `process-${id}`,
  attempts: 5,
  backoff: { type: "exponential", delay: 1000 },
  removeOnComplete: { age: 86400, count: 10000 },
  removeOnFail: false,
});
```

Five BullMQ attempts plus three Effect executions per attempt can multiply into
fifteen external calls. Prefer one retry owner per operation. Keep failed jobs
inspectable with an explicit retention/replay policy. Job-ID deduplication ends when
the job is removed; it does not replace database idempotency. See
[BullMQ retry behavior](https://docs.bullmq.io/guide/retrying-failing-jobs).

## 6. Make repeated processing safe

Assume a worker can crash after a commit but before BullMQ records completion.

1. Generate an internal delivery/operation ID before enqueueing. Scope it to the
   workspace and recipient as appropriate; an untrusted SMTP `Message-ID` is not a
   reliable uniqueness key.
2. Add a database unique constraint for that operation. Atomically persist the email
   and an outbox event in one transaction. Reprocessing should return the existing
   result and must still allow the pending outbox event to be dispatched.
3. An outbox dispatcher publishes pending events to BullMQ, then marks them published.
   A crash between those steps duplicates publication, so downstream consumers also
   need idempotency. Marking published first can lose work.
4. Store raw MIME/attachments durably and enqueue IDs/object keys. Use JSON-safe job
   fields: decimal strings for `bigint`, ISO strings for dates. Validate and decode
   at the consumer. Add a job schema version for rolling deploys.

```text
SMTP -> durable raw message + acceptance record -> acknowledge acceptance
                         |
                  recoverable processing
                         |
                email + outbox transaction
                         |
                dispatcher -> BullMQ -> idempotent consumer
```

The first durable handoff must be recoverable even if the process dies before
publishing a job. Return SMTP success only after taking durable responsibility;
otherwise return an appropriate temporary failure so the sending server can retry.
Configure Redis persistence/replication and backup recovery deliberately.

For outbound SMTP, a disconnect after sending DATA can leave delivery ambiguous.
A stable Message-ID or database flag cannot make a remote SMTP server deduplicate.
Record ambiguous outcomes, use provider idempotency keys where supported, and choose
an explicit retry/reconciliation policy. Effect does not provide exactly-once mail.

## 7. Inject dependencies and test without infrastructure

Services make dependencies visible in `R`. Layers assemble implementations once at
the application boundary. This standalone example supplies a fake repository:

```ts
import { Context, Effect, Layer } from "effect";

interface EmailRepositoryShape {
  readonly exists: (id: string) => Effect.Effect<boolean>;
}

class EmailRepository extends Context.Service<EmailRepository, EmailRepositoryShape>()(
  "selfmail/EmailRepository"
) {}

const check = Effect.gen(function* () {
  const repository = yield* EmailRepository;
  return yield* repository.exists("email-1");
});

const testLayer = Layer.succeed(EmailRepository, {
  exists: (id) => Effect.succeed(id === "email-1"),
});

const exists = await Effect.runPromise(check.pipe(Effect.provide(testLayer)));
if (!exists) throw new Error("Expected email-1 to exist");
```

A real repository should declare typed storage errors and wrap database calls using
`tryPromise`. Use `Layer.effect`/`Layer.scoped` for constructed services/resources;
keep the layer/runtime alive for the worker lifetime, rather than opening a database
pool for every job. See [services](https://effect.website/docs/v4/requirements-management/services).

## 8. Bound concurrency, own resources, observe outcomes

- Use `Effect.forEach(items, process, { concurrency: 8 })` for bounded parallel work.
  Failure normally interrupts siblings; completed external side effects remain.
  If every item needs an outcome, turn each into `Effect.exit(process(item))`.
- Use a shared semaphore when several flows share one connection/provider limit.
  An in-process limit is per replica; coordinate global limits through BullMQ/Redis.
  Concurrency limits do not enforce requests per second.
- Stream large MIME/attachment data with byte limits instead of loading everything
  into memory. Bound message size, queue capacity, and per-workspace outstanding work.
- Own clients with `Effect.acquireRelease` inside `Effect.scoped`. Acquisition belongs
  in the acquire Effect, not in a top-level Promise. Finalizers run on normal exit,
  failure, and interruption, but cannot run after SIGKILL or a machine crash. See
  [resource scopes](https://effect.website/docs/v4/resource-management/scope).
- On SIGTERM/SIGINT, stop accepting new work, await `worker.close()` to finish active
  jobs, then close producer queues and externally owned Redis/database clients.
  Give the deploy a drain deadline; crashed/stalled jobs must remain safe to replay.
- Validate secrets/configuration at startup with `Config`; fail startup for missing
  production credentials. Use `Redacted` for secrets and never log raw MIME, bodies,
  credentials, or recipients by default. Log internal operation IDs and error tags.
- Add `Effect.withSpan("email.process")` and structured log annotations around a job.
  Connect Effect's logger/tracer to Selfmail's observability stack explicitly; importing
  Effect does not automatically route its logs into `@selfmail/logging`.
- Track queue age, failed/stalled counts, retry rate, processing latency, outbox lag,
  and ambiguous outbound deliveries. Alert on stuck work, not only thrown errors.

## 9. Apply this to Selfmail, one boundary at a time

Start with `queues/domain-queue/src/check-domain.ts`: keep DNS errors distinguishable
from a successful lookup containing invalid records. The current implementation
converts lookup errors to `valid: false`; an outer retry cannot see those failures.
Retry transient lookup failures before converting them to a user-facing result.

Next, review `queues/inbound-queue/src/worker.ts`: it inserts an email, then enqueues
realtime work in a `completed` listener. A crash between those steps can lose the
notification; use an outbox for required follow-up work. Move job payloads toward
small, validated references and remove the need for unsafe database casts.

Practice with these failure drills before changing the production pipeline:

| Drill | Expected result |
| --- | --- |
| Construct an Effect without running it | No network/database operation |
| Inject two transient failures, then success | Exactly three calls with a two-retry budget |
| Submit an invalid job | No side effects; no repeated attempts |
| Enqueue the same operation twice | One durable logical result |
| Crash after DB commit, before job acknowledgement | Replay returns the same result |
| Crash after outbox publication | Duplicate publication causes no duplicate logical action |
| Fill a bounded local queue | Producer waits; memory remains bounded |
| Interrupt during an abortable request | Request aborts; finalizers run |
| Shut down with active BullMQ work | Active jobs drain or recover safely after restart |

Use fake services and Effect's version-matched `TestClock` for retry/deadline tests;
use a real test database/Redis for uniqueness, transaction, and crash recovery tests.
Adopt Effect incrementally: one typed operation, one explicit boundary, then one
failure policy. Durability and idempotency remain explicit application responsibilities.
