import { createLogger } from "@selfmail/logging";
import type { SMTPServerAddress } from "smtp-server";
import type { SelfmailSmtpSession } from "../types/session";

const logger = createLogger("smtp-inbound-rcpt-to");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = 100;

function extractDomain(email: string): string | null {
  const parts = email.split("@");
  if (parts.length !== 2) {
    return null;
  }
  return parts[1] || null;
}

export function validateRcptTo(
  address: SMTPServerAddress,
  session: SelfmailSmtpSession,
  callback: (err?: Error) => void
): void {
  const recipientAddress = address.address;
  const recipientCount = session.envelope.rcptTo?.length ?? 0;

  try {
    if (recipientCount >= MAX_RECIPIENTS) {
      logger.warn(`Too many recipients: ${recipientCount}`);
      callback(new Error("452 Too many recipients."));
      return;
    }

    if (!(recipientAddress && EMAIL_REGEX.test(recipientAddress))) {
      logger.warn(`Invalid recipient format: ${recipientAddress}`);
      callback(new Error("501 Invalid recipient address format."));
      return;
    }

    const domain = extractDomain(recipientAddress);
    if (!domain) {
      logger.warn(`Cannot extract domain: ${recipientAddress}`);
      callback(new Error("501 Invalid recipient domain."));
      return;
    }

    logger.info(`RCPT TO accepted: ${recipientAddress}`);
    callback();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`RCPT TO validation error: ${message}`);
    callback(new Error("451 Temporary error validating recipient."));
  }
}
