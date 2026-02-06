import { createLogger } from "@selfmail/logging";
import { Recipients } from "@selfmail/recipients";
import type { SMTPServerAddress } from "smtp-server";
import z from "zod";
import type { Callback } from "../types";
import type { SelfmailSmtpSession } from "../types/session";

const logger = createLogger("smtp-inbound-rcpt-to");

export class InvalidEmailError extends Error {
  constructor(email: string) {
    super(`Invalid email address: ${email}`);
    this.name = "InvalidEmailError";
  }
}

export abstract class RcptTo {
  static async parseEmail(mail: string) {
    const { success } = await z.email().safeParseAsync(mail);
    if (!success) {
      throw new InvalidEmailError(mail);
    }
  }

  static async init(
    address: SMTPServerAddress,
    session: SelfmailSmtpSession,
    callback: Callback
  ) {
    // Parsing Emails
    try {
      await RcptTo.parseEmail(address.address);
    } catch (error) {
      if (error instanceof InvalidEmailError) {
        logger.warn(`Invalid recipient email: ${address.address}`);
        callback(new Error("501 Invalid recipient address format."));
      } else {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        logger.error(`Error parsing recipient email: ${message}`);
        callback(new Error("451 Temporary error validating recipient."));
      }
    }

    // Check whether it's a postmaster email
    if (address.address.split("@")[0]?.toLowerCase() === "postmaster") {
      session.envelope.postmasterEmail = true;
      logger.info(`Postmaster Email received from ${session.remoteAddress}`);
      callback();
      return;
    }

    // Check senders Domain
    const domain = address.address.split("@")[1];
    if (!domain) {
      logger.warn(`Cannot extract domain: ${address.address}`);
      callback(new Error("501 Invalid recipient domain."));
      return;
    }

    // Check whether the recipient exists in our system
    const exists = await Recipients.check(address.address);

    if (!exists) {
      logger.warn(`Recipient does not exist: ${address.address}`);
      callback(new Error("550 No such user."));
    }
  }
}
