import { createLogger } from "@selfmail/logging";
import { db } from "database";
import type { ParsedMail } from "mailparser";
import { simpleParser } from "mailparser";
import { saveEmail } from "smtp-queue";
import type { SMTPServerDataStream } from "smtp-server";
import { rspamd } from "../lib/rspamd";
import type { Callback } from "../types";
import type { ExtendedSession } from "../types/session";

const logger = createLogger("smtp-inbound-data");

export abstract class Data {
  static async init(
    stream: SMTPServerDataStream,
    session: ExtendedSession,
    callback: Callback
  ): Promise<ReturnType<Callback>> {
    try {
      const s = stream.on("end", () => {
        if (s.sizeExceeded) {
          logger.error("Message too large");

          const err = Object.assign(new Error("Message too large"), {
            responseCode: 552,
          });

          throw callback(err);
        }
      });

      stream.on("error", (err) => {
        logger.error("Stream error", err);
        throw callback(new Error("Error receiving message data"));
      });

      const parsed = await simpleParser(s);

      const recipients = session.envelope.rcptTo.map((rcpt) => rcpt.address);

      if (recipients.length === 0) {
        return callback(new Error("No recipients specified"));
      }

      const sender = session.envelope.mailFrom?.address;
      if (!sender) {
        return callback(new Error("No sender specified"));
      }

      const { toAddresses, ccAddresses, bccAddresses } =
        Data.parseRecipientAddresses(parsed);

      const allRecipients = [...toAddresses, ...ccAddresses, ...bccAddresses];

      if (allRecipients.length === 0) {
        logger.warn("No valid recipient addresses found in parsed email");
      }

      for await (const recipientEmail of recipients) {
        const address = await db.address.findUnique({
          where: { email: recipientEmail },
          select: {
            id: true,
            email: true,
            MemberAddress: {
              where: { role: "owner" },
              select: { memberId: true },
            },
          },
        });

        if (!address) {
          logger.warn("Recipient address not found", { recipientEmail });
          return callback(
            new Error(`Recipient address not found: ${recipientEmail}`)
          );
        }

        if (address.MemberAddress.length === 0) {
          logger.error("No owner found for address", { recipientEmail });
          return callback(
            new Error(`No owner found for address: ${recipientEmail}`)
          );
        }

        if (address.MemberAddress.length > 1) {
          logger.error("Multiple owners found for address", { recipientEmail });
          return callback(
            new Error(`Multiple owners found for address: ${recipientEmail}`)
          );
        }

        const memberId = address.MemberAddress[0]?.memberId;
        if (!memberId) {
          return callback(new Error("Member ID not found"));
        }

        const { Limits } = await import("services/limits");
        const availableStorage = await Limits.checkLimit(memberId);
        const emailSize =
          BigInt(parsed.text?.length || 0) +
          BigInt(parsed.html?.toString().length || 0);

        if (availableStorage < emailSize) {
          logger.error("Storage limit exceeded", {
            recipientEmail,
            availableStorage: availableStorage.toString(),
            emailSize: emailSize.toString(),
          });
          return callback(
            new Error("Message rejected: Recipient storage quota exceeded")
          );
        }

        const clientIP = session.remoteAddress || "unknown";
        const clientHostname =
          session.clientHostname || session.hostNameAppearsAs || "unknown";

        const rspamdCheck = await rspamd.checkBody({
          from: sender,
          to: recipients,
          subject: parsed.subject || "(no subject)",
          body: parsed.text || parsed.html?.toString() || "",
          ip: clientIP !== "unknown" ? clientIP : undefined,
          helo: clientHostname !== "unknown" ? clientHostname : undefined,
        });

        if (rspamdCheck.action === "reject") {
          logger.warn("Rejected by Rspamd", {
            score: rspamdCheck.score,
            reason: rspamdCheck.reason,
            sender,
            recipient: recipientEmail,
          });
          return callback(
            new Error(
              `Message rejected: ${rspamdCheck.reason || "Identified as spam"}`
            )
          );
        }

        if (rspamdCheck.action === "greylist") {
          logger.warn("Greylisted by Rspamd", {
            score: rspamdCheck.score,
            sender,
            recipient: recipientEmail,
          });
          return callback(
            new Error("Message greylisted, please try again later")
          );
        }

        const determineSort = ():
          | "normal"
          | "important"
          | "spam"
          | "trash"
          | "sent" => {
          if (rspamdCheck.score >= rspamdCheck.required_score * 0.8)
            return "spam";
          if (rspamdCheck.action === "add header") return "spam";
          return "normal";
        };

        const headers: Record<string, unknown> = {};
        if (parsed.headers) {
          for (const [key, value] of parsed.headers) {
            headers[key] = value;
          }
        }

        const attachments = parsed.attachments?.map((att) => ({
          filename: att.filename,
          contentType: att.contentType,
          size: att.size,
          checksum: att.checksum,
          contentDisposition: att.contentDisposition,
          contentId: att.contentId,
        }));

        await saveEmail({
          messageId: parsed.messageId,
          subject: parsed.subject || "(no subject)",
          date: parsed.date,
          sizeBytes: emailSize,
          from: Data.parseAddressObjects(parsed.from) || [{ address: sender }],
          to:
            Data.parseAddressObjects(parsed.to) ||
            recipients.map((addr) => ({ address: addr })),
          cc: Data.parseAddressObjects(parsed.cc),
          bcc: Data.parseAddressObjects(parsed.bcc),
          replyTo: Data.parseAddressObjects(parsed.replyTo),
          text: parsed.text,
          html: parsed.html || undefined,
          headers,
          attachments,
          warning:
            rspamdCheck.action === "add header"
              ? "Potential spam detected"
              : undefined,
          spamScore: rspamdCheck.score,
          virusStatus: undefined,
          rawEmail: parsed.text || parsed.html?.toString(),
          addressId: address.id,
          contactId: undefined,
          sort: determineSort(),
        });

        logger.info("Email saved successfully", {
          messageId: parsed.messageId,
          recipient: recipientEmail,
          sender,
          subject: parsed.subject || "(no subject)",
        });
      }

      return callback();
    } catch (error) {
      logger.error(
        "Error in DATA handler",
        error instanceof Error ? error : undefined
      );
      return callback(new Error("Temporary server error"));
    }
  }

  static parseRecipientAddresses(parsed: ParsedMail): {
    toAddresses: string[];
    ccAddresses: string[];
    bccAddresses: string[];
  } {
    const toAddresses: string[] = [];
    const ccAddresses: string[] = [];
    const bccAddresses: string[] = [];

    if (parsed.to) {
      const toList = Array.isArray(parsed.to) ? parsed.to : [parsed.to];
      for (const to of toList) {
        if (to.value) {
          toAddresses.push(
            ...to.value
              .map((addr) => addr.address)
              .filter((a): a is string => !!a)
          );
        }
      }
    }

    if (parsed.cc) {
      const ccList = Array.isArray(parsed.cc) ? parsed.cc : [parsed.cc];
      for (const cc of ccList) {
        if (cc.value) {
          ccAddresses.push(
            ...cc.value
              .map((addr) => addr.address)
              .filter((a): a is string => !!a)
          );
        }
      }
    }

    if (parsed.bcc) {
      const bccList = Array.isArray(parsed.bcc) ? parsed.bcc : [parsed.bcc];
      for (const bcc of bccList) {
        if (bcc.value) {
          bccAddresses.push(
            ...bcc.value
              .map((addr) => addr.address)
              .filter((a): a is string => !!a)
          );
        }
      }
    }

    return { toAddresses, ccAddresses, bccAddresses };
  }

  static parseAddressObjects(
    addressObj:
      | { value: Array<{ address?: string; name?: string }> }
      | Array<{ value: Array<{ address?: string; name?: string }> }>
      | undefined
  ): Array<{ address: string; name?: string }> | undefined {
    if (!addressObj) {
      return undefined;
    }
    if (Array.isArray(addressObj)) {
      return addressObj
        .flatMap((obj) => obj.value)
        .map((addr) => ({
          address: addr.address || "",
          name: addr.name,
        }))
        .filter((addr) => addr.address);
    }
    return addressObj.value
      .map((addr) => ({
        address: addr.address || "",
        name: addr.name,
      }))
      .filter((addr) => addr.address);
  }
}
