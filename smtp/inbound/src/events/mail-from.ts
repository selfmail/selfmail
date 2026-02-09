import dns from "node:dns/promises";
import { createLogger } from "@selfmail/logging";
import type { SMTPServerAddress } from "smtp-server";
import { z } from "zod";
import type { SelfmailSmtpSession } from "../types/session";

const logger = createLogger("smtp-inbound-mail-from");

export class InvalidEmailError extends Error {
  constructor(email: string) {
    super(`Invalid email address: ${email}`);
    this.name = "InvalidEmailError";
  }
}

export type SpfResult =
  | "pass"
  | "fail"
  | "softfail"
  | "neutral"
  | "none"
  | "error"
  | "permissive";

export abstract class MailFrom {
  static async parseEmail(mail: string) {
    const { success } = await z.email().safeParseAsync(mail);
    if (!success) {
      throw new InvalidEmailError(mail);
    }
  }

  static async checkSpf(
    ip: string,
    domain: string,
    sender: string
  ): Promise<SpfResult> {
    try {
      const records = await dns.resolveTxt(domain);
      const spfRecord = records.flat().find((r) => r.startsWith("v=spf1"));

      if (!spfRecord) {
        return "none";
      }

      if (spfRecord.includes(`ip4:${ip}`) || spfRecord.includes(`ip6:${ip}`)) {
        return "pass";
      }

      if (spfRecord.includes("+all")) {
        return "permissive";
      }
      if (spfRecord.includes("-all")) {
        return "fail";
      }
      if (spfRecord.includes("~all")) {
        return "softfail";
      }

      const includeMatches = spfRecord.match(/include:([^\s]+)/g);
      if (includeMatches) {
        for (const include of includeMatches) {
          const includeDomain = include.replace("include:", "");
          const includeResult = await MailFrom.checkSpf(
            ip,
            includeDomain,
            sender
          );
          if (includeResult === "pass") {
            return "pass";
          }
        }
      }

      return "neutral";
    } catch {
      return "error";
    }
  }

  static async handleBounceEmail(
    session: SelfmailSmtpSession,
    callback: (err?: Error) => void
  ) {
    const domain = session.hostNameAppearsAs || session.clientHostname;

    if (!domain) {
      logger.warn("Bounce email with no identifiable domain");
      session.envelope.spamScore += 5;
      return callback();
    }

    const hasMxRecords = await MailFrom.checkMxRecords(domain);
    if (!hasMxRecords) {
      logger.warn(`No MX records found for bounce email domain: ${domain}`);
      session.envelope.spamScore += 5;
    }

    const spfResult = await MailFrom.checkSpf(
      session.remoteAddress,
      domain,
      ""
    );

    switch (spfResult) {
      case "fail":
        logger.warn(`SPF failed for bounce from ${session.remoteAddress}`);
        session.envelope.spamScore += 5;
        break;
      case "softfail":
        logger.info(`SPF softfail for bounce from ${session.remoteAddress}`);
        session.envelope.spamScore += 3;
        break;
      case "permissive":
        logger.warn(`SPF too permissive (+all) for bounce domain: ${domain}`);
        session.envelope.spamScore += 3;
        break;
      case "none":
        logger.info(`No SPF record for bounce domain: ${domain}`);
        session.envelope.spamScore += 2;
        break;
      case "neutral":
        session.envelope.spamScore += 1;
        break;
      case "error":
        logger.warn(`SPF check error for bounce domain: ${domain}`);
        session.envelope.spamScore += 1;
        break;
      default:
        break;
    }

    return callback();
  }

  static async checkMxRecords(domain: string): Promise<boolean> {
    try {
      const records = await dns.resolveMx(domain);
      return records.length > 0;
    } catch {
      return false;
    }
  }

  static async init(
    address: SMTPServerAddress,
    session: SelfmailSmtpSession,
    callback: (err?: Error) => void
  ) {
    if (!address?.address) {
      session.envelope.bounceEmail = true;

      logger.info(`Bounce Email received from ${session.remoteAddress}`);

      return MailFrom.handleBounceEmail(session, callback);
    }

    // Parse Email for possible Errors
    try {
      await MailFrom.parseEmail(address.address);
    } catch (error) {
      if (error instanceof InvalidEmailError) {
        logger.warn(`Invalid sender format: ${address.address}`);
        return callback(new Error("501 Invalid sender address format."));
      }
      logger.error(
        `Unexpected error during email parsing: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return callback(new Error("451 Temporary error validating sender."));
    }

    // Check senders Domain
    const domain = address.address.split("@")[1];
    if (!domain) {
      logger.warn(`Cannot extract domain: ${address.address}`);
      return callback(new Error("501 Invalid sender domain."));
    }

    // Check MX records
    const hasMxRecords = await MailFrom.checkMxRecords(domain);
    if (!hasMxRecords) {
      logger.warn(`No MX records found for domain: ${domain}`);
      session.envelope.spamScore += 5;
    }

    // Check SPF
    const spfResult = await MailFrom.checkSpf(
      session.remoteAddress,
      domain,
      address.address
    );

    switch (spfResult) {
      case "fail":
        logger.warn(
          `SPF failed for ${address.address} from ${session.remoteAddress}`
        );
        session.envelope.spamScore += 5;
        break;
      case "softfail":
        logger.info(`SPF softfail for ${address.address}`);
        session.envelope.spamScore += 3;
        break;
      case "permissive":
        logger.warn(`SPF too permissive (+all) for domain: ${domain}`);
        session.envelope.spamScore += 3;
        break;
      case "none":
        logger.info(`No SPF record for domain: ${domain}`);
        session.envelope.spamScore += 2;
        break;
      case "neutral":
        session.envelope.spamScore += 1;
        break;
      case "error":
        logger.warn(`SPF check error for domain: ${domain}`);
        session.envelope.spamScore += 1;
        break;
      default:
        break;
    }

    console.log("Continue processing mail");

    return callback();
  }
}
