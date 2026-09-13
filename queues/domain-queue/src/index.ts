import { type Job, UnrecoverableError, Worker } from "bullmq";
import { Effect, Match, Schema } from "effect";
import { checkDomainRecords } from "./check-domain";
import { connection } from "./connection";
import { DatabaseLive } from "./db";
import { findDomain } from "./find-domain";

const jobSchema = Schema.Struct({ domainId: Schema.String });

new Worker(
  "domain-queue",

  async (job: Job<unknown>) => {
    const program = Effect.gen(function* () {
      const { domainId } = yield* Schema.decodeUnknownEffect(jobSchema)(
        job.data
      );

      const domain = yield* findDomain(domainId);

      yield* Effect.logInfo("Domain loaded", {
        domainId: domain.id,
      });

      if (domain.verified && domain.verifiedAt) {
        yield* Effect.logInfo("Domain is verified", {
          domainId: domain.id,
          verifiedAt: domain.verifiedAt,
        });

        return `Domain ${domain.id} is verified`;
      }

      const records = yield* checkDomainRecords({
        domain: domain.domain,
        verficationToken: domain.verificationToken,
      }).pipe(
        Effect.tapErrorTag("DnsLookupError", (error) =>
          Effect.logError(`DNS lookup failed for ${domain.domain}`, {
            cause: error.cause,
          })
        )
      );

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
      }

      yield* Effect.logInfo("Domain records checked", {
        domainId: domain.id,
        records,
      });

      return {
        domainId: domain.id,
        verified: invalidRecords.length === 0,
      };
    }).pipe(
      Effect.provide(DatabaseLive),

      Effect.tapCause((cause) =>
        Effect.logError("Domain job failed", {
          jobId: job.id,
          cause,
        })
      )
    );

    type DomainJobError = Effect.Error<typeof program>;

    const toBullMqError = (error: DomainJobError): Error =>
      Match.value(error).pipe(
        Match.tag("DatabaseError", (error) =>
          error.retryable
            ? error
            : new UnrecoverableError(
                `Database query failed for domain ${error.domainId}`
              )
        ),

        Match.tag(
          "DomainNotFoundError",
          (error) =>
            new UnrecoverableError(`Domain ${error.domainId} not found`)
        ),

        Match.tag(
          "ConfigError",
          () => new UnrecoverableError("Invalid configuration for domain job")
        ),

        Match.tag(
          "SchemaError",
          () => new UnrecoverableError("Invalid domain job payload")
        ),

        Match.tag(
          "DnsLookupError",
          (error) => new Error(`DNS lookup failed: ${String(error.cause)}`)
        ),

        Match.exhaustive
      );

    await Effect.runPromise(
      program.pipe(
        Effect.match({
          onFailure: (error) => {
            throw toBullMqError(error);
          },
          onSuccess: (value) => value,
        })
      )
    );
  },

  {
    connection,
  }
);
