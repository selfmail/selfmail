import { db } from "@selfmail/db";
import { Context, Layer } from "effect";

export class Database extends Context.Service<Database, typeof db>()(
  "domain-queue/Database"
) {}

export const DatabaseLive = Layer.succeed(Database, db);

export const isTransientDatabaseError = (cause: unknown): boolean => {
  if (typeof cause !== "object" || cause === null) {
    return false;
  }

  const code =
    "code" in cause
      ? cause.code
      : "errorCode" in cause
        ? cause.errorCode
        : undefined;

  return (
    typeof code === "string" &&
    ["P1001", "P1002", "P1017", "P2024"].includes(code)
  );
};
