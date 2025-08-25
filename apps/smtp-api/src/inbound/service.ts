import { db } from "database";
import { status } from "elysia";
import MailComposer from "nodemailer/lib/mail-composer";
import type { InboundModule } from "./module";
import type { RspamdResult } from "./types";
import { Logs } from "services/logs";

export abstract class InboundService {
  /**
   * Connection of a new SMTP client. We are checking for spam (in the database) and if the
   * connection comes from the localhost. We are also performing rate-limiting on the client's IP.
   */
  static async handleConnection({
    hostname,
    ip,
  }: InboundModule.ConnectionBody) {
    return {
      valid: true,
    };
  }

  static async handleMailFrom({ from }: InboundModule.MailFromBody) {
    if (from.endsWith("@selfmail.app")) {
      throw status(403, "Selfmail addresses are not allowed");
    }

    return {
      valid: true,
    };
  }

  static async handleRcptTo({ to, mailFrom }: InboundModule.RcptToBody) {
    const address = await db.address.findUnique({
      where: {
        email: to,
      },
    });

    if (!address) {
      throw status(404, "Address not found");
    }

    Logs.log("Address was found!");

    const contact = await db.contact.findUnique({
      where: {
        email_addressId: {
          email: mailFrom,
          addressId: address.id,
        },
      },
    });

    if (contact?.blocked) {
      Logs.log("Contact blocked!");
      throw status(403, "Contact is blocked");
    }

    Logs.log("Contact was found!");

    if (!contact) {
      Logs.log("Contact not found, creating...");
      const newContact = await db.contact.create({
        data: {
          email: mailFrom,
          addressId: address.id,
        },
      });

      if (!newContact) {
        throw status(500, "Failed to create contact");
      }
    }
    Logs.log("Return valid result!");
    return {
      valid: true,
    };
  }

  // TODO: handle attachments properly (with cloudflare r2 or similar)
  static async handleData({
    attachments,
    subject,
    text,
    html,
    mailFrom,
    to,
  }: InboundModule.DataBody) {
    const address = await db.address.findUnique({
      where: {
        email: to,
      },
    });

    if (!address) {
      throw status(404, "Address not found");
    }

    const contact = await db.contact.findUnique({
      where: {
        email_addressId: {
          email: mailFrom,
          addressId: address.id,
        },
      },
    });

    if (!contact) {
      throw status(404, "Contact not found");
    }

    // save the email to the database
    const email = await db.email.create({
      data: {
        subject,
        body: text,
        html,
        addressId: address.id,
        contactId: contact.id,
      },
    });

    if (!email) {
      throw status(500, "Failed to save email");
    }

    return {
      valid: true,
    };
  }
  static async spam({
    body,
    subject,
    html,
    from,
    to,
    attachments,
  }: InboundModule.SpamBody) {
    // Convert File objects to Attachment format for MailComposer
    const mailAttachments = attachments
      ? await Promise.all(
          attachments.map(async (file) => ({
            filename: file.name,
            content: Buffer.from(await file.arrayBuffer()),
            contentType: file.type,
          })),
        )
      : [];

    // convert mail to eml file
    const mail = new MailComposer({
      from: from,
      to,
      subject,
      text: body,
      html,
      attachments: mailAttachments,
    });

    // convert to Raw RFC822
    const eml = await new Promise<Buffer>((resolve, reject) =>
      mail
        .compile()
        .build((err, message) => (err ? reject(err) : resolve(message))),
    );

    // call rspamd to check if the email has spam
    const res = await fetch("http://127.0.0.1:11333/checkv2", {
      method: "POST",
      headers: { "Content-Type": "message/rfc822" },
      body: eml,
    });

    if (res.status !== 200) {
      return status(500, "Failed to check email for spam");
    }

    const result = (await res.json()) as RspamdResult;

    if (result.action === "reject" || result.score > 5) {
      return status(403, "Email rejected by spam filter");
    }

    return {
      score: result.score,
      action: result.action,
    };
  }
}
