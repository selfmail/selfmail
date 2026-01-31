import dns from "node:dns/promises";
import { createLogger } from "@selfmail/logging";
import type { SMTPServerAddress } from "smtp-server";
import type { SelfmailSmtpSession } from "../types/session";

const logger = createLogger("smtp-inbound-mail-from");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPAM_SCORE_NO_MX = 3;
const SPAM_SCORE_SPF_FAIL = 5;
const SPAM_SCORE_SPF_SOFTFAIL = 2;
const SPAM_SCORE_SPF_NONE = 1;

type SpfResult = "pass" | "fail" | "softfail" | "neutral" | "none" | "error";

async function checkMxRecords(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

async function checkSpf(
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
      return "pass";
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
        const includeResult = await checkSpf(ip, includeDomain, sender);
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

function extractDomain(email: string): string | null {
  const parts = email.split("@");
  if (parts.length !== 2) {
    return null;
  }
  return parts[1] || null;
}

export async function validateMailFrom(
  address: SMTPServerAddress,
  session: SelfmailSmtpSession,
  callback: (err?: Error) => void
): Promise<void> {
  const clientAddress = session.remoteAddress || "unknown";
  const senderAddress = address.address;

  try {
    if (!(senderAddress && EMAIL_REGEX.test(senderAddress))) {
      logger.warn(`Invalid sender format: ${senderAddress}`);
      return callback(new Error("501 Invalid sender address format."));
    }

    const domain = extractDomain(senderAddress);
    if (!domain) {
      logger.warn(`Cannot extract domain: ${senderAddress}`);
      return callback(new Error("501 Invalid sender domain."));
    }

    const hasMx = await checkMxRecords(domain);
    if (!hasMx) {
      logger.warn(`No MX records for domain: ${domain}`);
      session.envelope.spamScore += SPAM_SCORE_NO_MX;
    }

    const spfResult = await checkSpf(clientAddress, domain, senderAddress);
    switch (spfResult) {
      case "fail":
        logger.warn(`SPF fail for ${senderAddress} from ${clientAddress}`);
        session.envelope.spamScore += SPAM_SCORE_SPF_FAIL;
        break;
      case "softfail":
        logger.info(`SPF softfail for ${senderAddress}`);
        session.envelope.spamScore += SPAM_SCORE_SPF_SOFTFAIL;
        break;
      case "none":
        session.envelope.spamScore += SPAM_SCORE_SPF_NONE;
        break;
      case "pass":
        logger.info(`SPF pass for ${senderAddress}`);
        break;
      default:
        break;
    }

    logger.info(
      `MAIL FROM accepted: ${senderAddress} (score: ${session.envelope.spamScore})`
    );
    return callback();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`MAIL FROM validation error: ${message}`);
    return callback(new Error("451 Temporary error validating sender."));
  }
}
