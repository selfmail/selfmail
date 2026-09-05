import { Context, Effect, Layer } from "effect";
import { AppConfig } from "../../config";

export class Rspamd extends Context.Service<Rspamd>()("@selfmail/spam/rspamd", {
  make: Effect.gen(function* () {
    const config = yield* AppConfig;
    return {
      scan: Effect.fn("@selfmail/spam/scanRspamd")(function* () {
        fetch("");
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
