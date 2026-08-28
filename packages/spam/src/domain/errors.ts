import { Data } from "effect";

export class RspamdClientError extends Data.TaggedError("RspamdClientError")<{
  readonly message: string;
}> {}
