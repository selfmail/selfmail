import { simpleParser } from "mailparser";
import type { SMTPServerDataStream, SMTPServerSession } from "smtp-server";
import { client } from "@/lib/client";
import { createInboundLog } from "@/utils/logs";
import { z } from "zod/v4";

const log = createInboundLog("data");

// 4. Handling function
export async function handleData(
  stream: SMTPServerDataStream,
  session: SMTPServerSession,
  callback: (err?: Error | null) => void,
): Promise<void> {
  log(
    `Handle DATA Command for ${session.id}, remote address: ${session.remoteAddress || "unknown"}`,
  );

  console.log(session);

  try {
    const s = stream.on("end", () => {
      if (s.sizeExceeded) {
        const err = Object.assign(new Error("Message too large"), {
          responseCode: 552,
        });
        throw callback(err);
      }
    });
    // Parse the email from the stream
    const parsed = await simpleParser(s);

    log(
      `Parsed email - From: ${parsed.from?.text}, To: ${
        Array.isArray(parsed.to) ? parsed.to[0]?.text : parsed.to?.text || ""
      }, Subject: ${parsed.subject}`,
    );

    // Extract email data
    const emailData = {
      messageId: parsed.messageId || "",
      // @ts-expect-error we know it's a string
      from: (session.envelope.mailFrom.address as string) ?? parsed.from,
      to: Array.isArray(parsed.to)
        ? parsed.to.map((addr) => addr.text).join(", ")
        : parsed.to?.text || "",
      cc: Array.isArray(parsed.cc)
        ? parsed.cc.map((addr) => addr.text).join(", ")
        : parsed.cc?.text || "",
      bcc: Array.isArray(parsed.bcc)
        ? parsed.bcc.map((addr) => addr.text).join(", ")
        : parsed.bcc?.text || "",
      subject: parsed.subject || "",
      text: parsed.text || "",
      html: parsed.html || "",
      date: parsed.date || new Date(),
      attachments:
        parsed.attachments?.map((att) => ({
          filename: att.filename || "",
          contentType: att.contentType || "",
          size: att.size || 0,
          content: att.content?.toString("base64") || "",
        })) || [],
      headers: parsed.headers
        ? Object.fromEntries(
            Object.entries(parsed.headers).map(([key, value]) => [
              key,
              Array.isArray(value) ? value.join(", ") : String(value),
            ]),
          )
        : {},
      sessionId: session.id,
      remoteAddress: session.remoteAddress || "",
    };

    console.log(emailData);

    const spam = await client.inbound.spam.post({
      body: emailData.text,
      subject: emailData.subject,
      html: emailData.html,
      from: emailData.from,
      to: emailData.to,
      attachments: parsed.attachments?.map((att) => {
        // Create a proper File object from the attachment
        const buffer = att.content || Buffer.from("");
        const file = new File([buffer], att.filename || "unknown", {
          type: att.contentType || "application/octet-stream",
        });
        return file;
      }),
    });

    if (spam.error) {
      console.log(spam.error);
      // formatting elysia error to string
      const errorMessage =
        typeof spam.error.value === "string"
          ? spam.error.value
          : "Unknown error";

      return callback(new Error(errorMessage));
    }

    // Send to your API endpoint
    const res = await client.inbound.data.post({
      attachments:
        parsed.attachments?.map((att) => {
          // Create proper File objects for the data endpoint
          const buffer = att.content || Buffer.from("");
          const file = new File([buffer], att.filename || "unknown", {
            type: att.contentType || "application/octet-stream",
          });
          return file;
        }) || [],
      mailFrom: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    });

    console.log(res.error);

    log(
      `Email processed successfully for session ${session.id}, response: ${res.status}`,
    );

    // Call callback to indicate success
    callback();
  } catch (error) {
    log(`Error processing email for session ${session.id}: ${error}`);
    callback(error instanceof Error ? error : new Error(String(error)));
  }
}
