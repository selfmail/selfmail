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

interface VerifyDomainRecordsInput {
  domain: { id: string; domain: string };
  verificationToken: string;
}

export const verifyDomainRecordsExternal = ({
  domain,
  verificationToken,
}: VerifyDomainRecordsInput) =>
  Effect.runPromise(
    Effect.gen(function* () {
      const records = yield* checkDomainRecords({
        domain: domain.domain,
        verificationToken,
      });

      yield* Effect.forEach(Object.entries(records), ([type, record]) => {
        const log = record.valid ? Effect.logInfo : Effect.logWarning;
        return log(
          `${type.toUpperCase()} record ${record.valid ? "valid" : "invalid"}`,
          {
            domainId: domain.id,
            ...record,
          }
        );
      });

      return {
        verified: Object.values(records).every((record) => record.valid),
        records,
      };
    })
  );
