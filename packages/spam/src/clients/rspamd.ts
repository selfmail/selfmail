import { Context, type Effect } from "effect";
import type { RspamdClientError } from "../domain/errors";

export interface RspamdResult {
  readonly score: number;
  readonly requiredScore: number;
  readonly action: string;

  readonly symbols: ReadonlyArray<{
    readonly name: string;
    readonly score: number;
  }>;
}

export class RspamdClient extends Context.Tag("@selfmail/spam/RspamdClient")<
  RspamdClient,
  {
    readonly scan: (
      message: Uint8Array
    ) => Effect.Effect<RspamdResult, RspamdClientError>;
  }
>() {}
