import { BunSocket } from "@effect/platform-bun";
import { Context, Data, Deferred, Effect, Layer, Ref, Stream } from "effect";
import { AppConfig } from "../../config";
import type { Evidence } from "../../domain/evidence";

const INSTREAM_COMMAND = Buffer.from("zINSTREAM\0");
const END_OF_STREAM = Buffer.alloc(4);

type ClamAVResult =
  | { readonly infected: false; readonly viruses: readonly [] }
  | { readonly infected: true; readonly viruses: readonly string[] };

export class ClamAVScanError extends Data.TaggedError("ClamAVScanError")<{
  readonly cause?: unknown;
  readonly message: string;
}> {}

const parseResponse = Effect.fn("@selfmail/spam/ClamAVParseResponse")(
  function* (response: string) {
    const result = response.replaceAll("\0", "").trim();

    if (result.endsWith(" OK")) {
      return { infected: false, viruses: [] } satisfies ClamAVResult;
    }

    if (result.endsWith(" FOUND")) {
      const separator = result.indexOf(": ");
      const viruses = result
        .slice(separator === -1 ? 0 : separator + 2, -" FOUND".length)
        .split(",")
        .map((virus) => virus.trim())
        .filter(Boolean);

      if (viruses.length > 0) {
        return { infected: true, viruses } satisfies ClamAVResult;
      }
    }

    return yield* Effect.fail(
      new Error(`Unexpected ClamAV response: ${result || "empty response"}`)
    );
  }
);

const scanAttachment = Effect.fn("@selfmail/spam/ClamAVScanAttachment")(
  function* (attachment: File, host: string, port: number, timeout: number) {
    return yield* Effect.scoped(
      Effect.gen(function* () {
        const socket = yield* BunSocket.makeNet({
          host,
          port,
          openTimeout: timeout,
        });
        const writer = yield* socket.writer;
        const response = yield* Deferred.make<string>();
        const received = yield* Ref.make("");
        const decoder = new TextDecoder();

        const read = socket
          .run((data) =>
            Effect.gen(function* () {
              const current = yield* Ref.updateAndGet(
                received,
                (value) => value + decoder.decode(data, { stream: true })
              );

              if (current.includes("\0")) {
                yield* Deferred.succeed(response, current);
              }
            })
          )
          .pipe(
            Effect.andThen(
              Effect.fail(
                new Error("ClamAV closed the connection without a response")
              )
            )
          );

        const protocol = Effect.gen(function* () {
          yield* writer(INSTREAM_COMMAND);
          yield* Stream.fromReadableStream({
            evaluate: () => attachment.stream(),
            onError: (cause) => cause,
            releaseLockOnEnd: true,
          }).pipe(
            Stream.runForEach((data) =>
              Effect.gen(function* () {
                const size = Buffer.allocUnsafe(4);
                size.writeUInt32BE(data.byteLength);
                yield* writer(size);
                yield* writer(data);
              })
            )
          );
          yield* writer(END_OF_STREAM);

          return yield* Deferred.await(response);
        });

        return yield* Effect.raceFirst(protocol, read).pipe(
          Effect.timeoutOrElse({
            duration: timeout,
            orElse: () =>
              Effect.fail(
                new Error(`ClamAV scan timed out after ${timeout}ms`)
              ),
          }),
          Effect.flatMap(parseResponse)
        );
      })
    );
  }
);

export class ClamAV extends Context.Service<ClamAV>()("@selfmail/spam/clamav", {
  make: Effect.gen(function* () {
    const config = yield* AppConfig;

    return {
      scan: Effect.fn("@selfmail/spam/ClamAVScan")(function* (
        attachment: File
      ) {
        const result = yield* scanAttachment(
          attachment,
          config.clamavHost,
          config.clamavPort,
          config.clamavTimeout
        ).pipe(
          Effect.mapError(
            (cause) =>
              new ClamAVScanError({
                cause,
                message: `Failed to scan attachment ${attachment.name}`,
              })
          )
        );

        return {
          id: crypto.randomUUID(),
          detector: "clamav",
          category: "malware",
          score: result.infected ? 100 : 0,
          confidence: 1,
          reason: result.infected
            ? `Malware detected: ${result.viruses.join(", ")}`
            : "No malware detected",
          tags: result.infected ? ["malware", ...result.viruses] : ["clean"],
          metadata: {
            fileName: attachment.name,
            mediaType: attachment.type || "application/octet-stream",
            size: attachment.size,
            infected: result.infected,
            viruses: result.viruses,
          },
        } satisfies Evidence;
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
