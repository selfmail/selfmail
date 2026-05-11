import { validateEvent } from "@polar-sh/sdk/webhooks";

export type PolarWebhookPayload = ReturnType<typeof validateEvent>;

export class PolarWebhooks {
  webhookSecret: string;

  constructor(webhookSecret?: string) {
    this.webhookSecret =
      webhookSecret || process.env.POLAR_WEBHOOK_SECRET || "";
  }

  validate({
    body,
    headers,
    webhookSecret = this.webhookSecret,
  }: {
    body: string | Buffer;
    headers: Headers | Record<string, string>;
    webhookSecret?: string;
  }): PolarWebhookPayload {
    if (!webhookSecret) {
      throw new Error("Polar webhook secret is required");
    }

    return validateEvent(body, normalizeHeaders(headers), webhookSecret);
  }
}

const normalizeHeaders = (headers: Headers | Record<string, string>) => {
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  return headers;
};
