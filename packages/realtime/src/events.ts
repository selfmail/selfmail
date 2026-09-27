import { Schema } from "effect";

export const RealtimeEvents = {
  "mail.received": Schema.Struct({
    mailId: Schema.String,
    mailboxId: Schema.String,
  }),

  "mail.updated": Schema.Struct({
    mailId: Schema.String,
    mailboxId: Schema.String,
  }),

  // TODO: add notification schema
  notification: Schema.Struct({
    mailId: Schema.String,
    mailboxId: Schema.String,
  }),

  "domain.verified": Schema.Struct({
    domainId: Schema.String,
  }),
} as const;

export type EventChannel = keyof typeof RealtimeEvents;
export type EventPayload<C extends EventChannel> = Schema.Schema.Type<
  (typeof RealtimeEvents)[C]
>;
