import { saveEmail } from "@selfmail/inbound-queue";
import { createLogger } from "@selfmail/logging";
import { simpleParser } from "mailparser";
import type { SMTPServerDataStream } from "smtp-server";
import { ClamAVClient, RspamdClient } from "spam";
import type { SelfmailSmtpSession } from "../types/session";

const logger = createLogger("smtp-inbound-data");

class MessageSizeExceededError extends Error {
  constructor(size: number) {
    super(`Message size ${size} exceeds maximum allowed.`);
    this.name = "MessageSizeExceededError";
  }
}

export abstract class Data {
  static MAX_EMAIL_SIZE = 25 * 1024 * 1024; // 25 MB
  static SPAM_THRESHOLD = 5.0;
  static async streamToBuffer(stream: SMTPServerDataStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    let totalSize = 0;

    for await (const chunk of stream) {
      totalSize += chunk.length;
      if (totalSize > Data.MAX_EMAIL_SIZE) {
        throw new MessageSizeExceededError(totalSize);
      }
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  static rspamd = new RspamdClient({
    host: process.env.RSPAMD_HOST || "localhost",
    port: Number(process.env.RSPAMD_PORT) || 11_333,
  });

  static clamav = new ClamAVClient({
    host: process.env.CLAMAV_HOST || "localhost",
    port: Number(process.env.CLAMAV_PORT) || 3310,
  });

  static async init(
    stream: SMTPServerDataStream,
    session: SelfmailSmtpSession,
    callback: (err?: Error | null) => void
  ) {
    const clientAddress = session.remoteAddress || "unknown";
    const mailFromAddr = session.envelope.mailFrom;
    const mailFrom = mailFromAddr ? mailFromAddr.address : "";
    const rcptTo = session.envelope.rcptTo.map((r) => r.address);
    // Handle Stream
    try {
      const emailBuffer = await Data.streamToBuffer(stream);

      const emailContent = emailBuffer.toString("utf-8");

      const parsed = await simpleParser(emailBuffer);

      const spamResult = await Data.rspamd.checkBody({
        from: mailFrom,
        to: rcptTo,
        subject: parsed.subject || "",
        body: emailContent,
        ip: clientAddress,
        helo: session.hostNameAppearsAs,
      });

      const totalScore = session.envelope.spamScore + spamResult.score;

      if (totalScore >= Data.SPAM_THRESHOLD) {
        logger.warn(
          `Email from ${clientAddress} marked as spam (score: ${totalScore.toFixed(
            2
          )})`
        );
        // Optionally, you could reject the email here instead of accepting it.
        // return callback(new Error("550 Message rejected as spam."));
      }

      const clamavResult = await Data.clamav.scanBuffer(emailBuffer);
      if (clamavResult.isInfected) {
        logger.warn(
          `Email from ${clientAddress} rejected due to virus: ${clamavResult.viruses.join(
            ", "
          )}`
        );
        return callback(new Error("550 Message rejected due to virus."));
      }

      try {
        console.log("hey");
      } catch (e) {
        logger.error(
          `Internal error during queueing email from ${clientAddress}: ${e instanceof Error ? e.message : "Unknown error"}`
        );
        return callback(new Error("451 Temporary error processing message."));
      }

      await saveEmail({});

      callback();
      return;
    } catch (error) {
      if (error instanceof MessageSizeExceededError) {
        logger.warn(
          `Rejected email from ${session.remoteAddress}: ${error.message}`
        );
        callback(new Error("552 Message size exceeds limit."));
        return;
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      logger.error(
        `Error reading email from ${session.remoteAddress}: ${message}`
      );
      callback(new Error("451 Temporary error processing message."));
      return;
    }
  }
}
