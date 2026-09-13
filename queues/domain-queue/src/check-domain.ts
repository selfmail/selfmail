import { resolveMx, resolveTxt } from "node:dns/promises";
import { Data, Effect } from "effect";
import { AppConfig } from "./config";

class DnsLookupError extends Data.TaggedError("DnsLookupError")<{
  hostname: string;
  cause: unknown;
}> {}

const normalizeHostname = (value: string) =>
  value.toLowerCase().replace(/\.$/, "");

const verifyMx = (hostname: string, expectedExchange: string) =>
  Effect.tryPromise({
    try: () => resolveMx(hostname),
    catch: (cause) => new DnsLookupError({ hostname, cause }),
  }).pipe(
    Effect.map((records) => ({
      type: "MX" as const,
      hostname,
      valid: records.some(
        ({ exchange }) =>
          normalizeHostname(exchange) === normalizeHostname(expectedExchange)
      ),
      expected: expectedExchange,
      actual: records,
    }))
  );

const verifyTxt = (hostname: string, expected: string) =>
  Effect.tryPromise({
    try: () => resolveTxt(hostname),
    catch: (cause) => new DnsLookupError({ hostname, cause }),
  }).pipe(
    Effect.map((records) => {
      const values = records.map((parts) => parts.join(""));

      return {
        type: "TXT" as const,
        hostname,
        valid: values.includes(expected),
        expected,
        actual: values,
      };
    })
  );

export const checkDomainRecords = Effect.fn("CheckDomainRecords")(
  function* (domain: { domain: string; verficationToken: string }) {
    const config = yield* AppConfig;

    return yield* Effect.all(
      {
        mx: verifyMx(domain.domain, config.mailServerUrl),

        spf: verifyTxt(
          domain.domain,
          `v=spf1 include:_spf.${config.mailServerUrl} ~all`
        ),

        dkim: verifyTxt(
          `selfmail._domainkey.${domain.domain}`,
          "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY"
        ),

        verification: verifyTxt(
          "selfmail-verification",
          `verification=${domain.verficationToken}`
        ),

        dmarc: verifyTxt(`_dmarc.${domain.domain}`, "v=DMARC1; p=none"),
      },
      {
        concurrency: "unbounded",
      }
    );
  }
);
