import { Queue } from "bullmq";
import { Effect } from "effect";
import { checkDomainRecords } from "./check-domain";
import { connection } from "./connection";

const queue = new Queue("domain-queue", {
  connection,
});

export const addDomainToQueue = async (domainId: string) => {
  await queue.add(
    "check-domain",
    { domainId },
    { removeOnComplete: true, removeOnFail: true }
  );
};

// Returns true or false, based on whether the domain has all needed dns records,
// used in other parts of the system to determine whether a domain is verified or not
export const verifyDomainRecordsExternal = ({
  domain,
  verificationToken,
}: {
  domain: { id: string; domain: string };
  verificationToken: string;
}) =>
  Effect.runPromise(
    Effect.gen(function* () {
      const records = yield* checkDomainRecords({
        domain: domain.domain,
        verificationToken,
      }).pipe(
        Effect.catchTag("DnsLookupError", (error) =>
          Effect.logWarning("DNS lookup error", {
            domainId: domain.id,
            hostname: error.hostname,
            cause: error.cause,
          }).pipe(Effect.as(undefined))
        )
      );

      if (!records) {
        yield* Effect.logWarning("DNS records could not be verified", {
          domainId: domain.id,
        });
        return false;
      }

      const checks = [
        ["MX", records.mx],
        ["SPF", records.spf],
        ["DKIM", records.dkim],
      ] as const;

      const invalidRecords = checks.filter(([, record]) => !record.valid);

      yield* Effect.forEach(invalidRecords, ([type, record]) =>
        Effect.logWarning(`${type} record invalid`, {
          domainId: domain.id,
          expected: record.expected,
          actual: record.actual,
        })
      );

      if (invalidRecords.length === 0) {
        yield* Effect.logInfo("All DNS records are valid", {
          domainId: domain.id,
        });

        return true;
      }

      return false;
    })
  );
