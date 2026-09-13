import { Data, Effect } from "effect";
import { Database, isTransientDatabaseError } from "./db";

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  domainId: string;
  cause: unknown;
  retryable: boolean;
}> {}

class DomainNotFoundError extends Data.TaggedClass("DomainNotFoundError")<{
  domainId: string;
}> {}

export const findDomain = Effect.fn("FindDomain")(function* (domainId: string) {
  const database = yield* Database;
  const result = yield* Effect.tryPromise({
    try: () =>
      database.domain.findUniqueOrThrow({
        where: {
          id: domainId,
        },
      }),
    catch: (cause) =>
      new DatabaseError({
        cause,
        domainId,
        retryable: isTransientDatabaseError(cause),
      }),
  });

  if (result === null) {
    return yield* Effect.fail(
      new DomainNotFoundError({
        domainId,
      })
    );
  }

  return result;
});
