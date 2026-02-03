import { createLogger } from "@selfmail/logging";
import { simpleParser } from "mailparser";
import type { SMTPServerDataStream } from "smtp-server";
import { ClamAVClient, RspamdClient } from "spam";
import type { SelfmailSmtpSession } from "../types/session";

const logger = createLogger("smtp-inbound-data");

const SPAM_THRESHOLD = 10;
const MAX_EMAIL_SIZE = 25 * 1024 * 1024;

const rspamd = new RspamdClient({
  host: process.env.RSPAMD_HOST || "localhost",
  port: Number(process.env.RSPAMD_PORT) || 11_333,
});

const clamav = new ClamAVClient({
  host: process.env.CLAMAV_HOST || "localhost",
  port: Number(process.env.CLAMAV_PORT) || 3310,
});

async function streamToBuffer(stream: SMTPServerDataStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let totalSize = 0;

  for await (const chunk of stream) {
    totalSize += chunk.length;
    if (totalSize > MAX_EMAIL_SIZE) {
      throw new Error("552 Message size exceeds maximum allowed.");
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export async function handleData(
  stream: SMTPServerDataStream,
  session: SelfmailSmtpSession,
  callback: (err?: Error | null) => void
): Promise<void> {
  const clientAddress = session.remoteAddress || "unknown";
  const mailFromAddr = session.envelope.mailFrom;
  const mailFrom = mailFromAddr ? mailFromAddr.address : "";
  const rcptTo = session.envelope.rcptTo.map((r) => r.address);

  try {
    const emailBuffer = await streamToBuffer(stream);
    const emailContent = emailBuffer.toString("utf-8");

    const parsed = await simpleParser(emailBuffer);
    const subject = parsed.subject || "";

    const spamResult = await rspamd.checkBody({
      from: mailFrom,
      to: rcptTo,
      subject,
      body: emailContent,
      ip: clientAddress,
      helo: session.hostNameAppearsAs,
    });

    const totalScore = session.envelope.spamScore + spamResult.score;

    if (parsed.attachments && parsed.attachments.length > 0) {
      const scanResults = await clamav.scanBuffers(
        parsed.attachments.map((att) => ({
          buffer: att.content,
          filename: att.filename,
        }))
      );

      const infected = scanResults.filter((r) => r.isInfected);
      if (infected.length > 0) {
        const viruses = infected.flatMap((r) => r.viruses).join(", ");
        logger.warn(`Rejected virus from ${mailFrom}: ${viruses}`);
        callback(new Error("550 Message rejected: virus detected."));
        return;
      }
    }

    if (spamResult.action === "reject" || totalScore >= SPAM_THRESHOLD) {
      logger.warn(
        `Rejected spam from ${mailFrom} (score: ${totalScore}, action: ${spamResult.action})`
      );
      callback(new Error("550 Message rejected as spam."));
      return;
    }

    if (spamResult.action === "greylist") {
      logger.info(`Greylisting ${mailFrom}`);
      callback(new Error("451 Please try again later."));
      return;
    }

    logger.info(
      `Email accepted from ${mailFrom} to ${rcptTo.join(", ")} (score: ${totalScore})`
    );

    // TODO: Queue email for delivery

    callback(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.startsWith("552") || message.startsWith("550")) {
      logger.warn(`Data rejection: ${message}`);
      callback(new Error(message));
      return;
    }

    logger.error(`Data processing error for ${clientAddress}: ${message}`);
    callback(new Error("451 Temporary error processing message."));
  }
}
