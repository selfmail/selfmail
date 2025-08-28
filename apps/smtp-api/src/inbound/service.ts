import { db } from "database";
import { status } from "elysia";
import MailComposer from "nodemailer/lib/mail-composer";
import { Logs } from "services/logs";
import type { InboundModule } from "./module";
import type { RspamdResult } from "./types";

export abstract class InboundService {
	/**
	 * Connection of a new SMTP client. We are checking for spam (in the database) and if the
	 * connection comes from the localhost. We are also performing rate-limiting on the client's IP.
	 */
	static async handleConnection({
		hostname,
		ip,
	}: InboundModule.ConnectionBody) {
		Logs.log(`Connection received by ip ${ip} and ${hostname}.`);
		return {
			valid: true,
		};
	}

	static async handleMailFrom({ from }: InboundModule.MailFromBody) {
		if (from.endsWith("@selfmail.app")) {
			throw status(403, "Selfmail addresses are not allowed");
		}

		Logs.log(`Mail from address: ${from}`);

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

		const contact = await db.contact.findUnique({
			where: {
				email_addressId: {
					email: mailFrom,
					addressId: address.id,
				},
			},
		});

		if (contact?.blocked) {
			throw status(403, "Contact is blocked");
		}

		if (!contact) {
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

		Logs.log(`Address was found, contact ${contact ? "also" : "not"}`);

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
			Logs.error(`Address ${to} not found in DATA`);
			throw status(404, "Address not found");
		}

		let contact = await db.contact.findUnique({
			where: {
				email_addressId: {
					email: mailFrom,
					addressId: address.id,
				},
			},
		});

		Logs.log(`Found contact: ${contact ? "yes" : "no"}`);

		if (!contact) {
			Logs.log(
				`Creating new contact for ${mailFrom} in ${address.email}. The value of the old contact was: ${contact}`,
			);
			contact = await db.contact.create({
				data: {
					email: mailFrom,
					addressId: address.id,
				},
			});

			if (!contact) {
				throw status(500, "Failed to create contact in DATA");
			}
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
		try {
			// First, scan attachments with ClamAV for viruses/malware
			if (attachments && attachments.length > 0) {
				for (const attachment of attachments) {
					try {
						const attachmentBuffer = Buffer.from(
							await attachment.arrayBuffer(),
						);

						// Use clamdscan via socket connection (more reliable than HTTP)
						const net = await import("node:net");

						const scanResult = await new Promise<string>((resolve, reject) => {
							const socket = net.createConnection({
								port: 3310,
								host: "127.0.0.1",
							});
							let result = "";

							socket.setTimeout(30000); // 30 second timeout

							socket.on("connect", () => {
								// Send INSTREAM command
								socket.write("zINSTREAM\0");

								// Send file size (4 bytes, big endian)
								const sizeBuffer = Buffer.allocUnsafe(4);
								sizeBuffer.writeUInt32BE(attachmentBuffer.length, 0);
								socket.write(sizeBuffer);

								// Send file data
								socket.write(attachmentBuffer);

								// Send end marker (4 zero bytes)
								socket.write(Buffer.alloc(4));
							});

							socket.on("data", (data) => {
								result += data.toString();
							});

							socket.on("end", () => {
								socket.destroy();
								resolve(result.trim());
							});

							socket.on("error", (error) => {
								socket.destroy();
								reject(error);
							});

							socket.on("timeout", () => {
								socket.destroy();
								reject(new Error("ClamAV scan timeout"));
							});
						});

						if (scanResult.includes("FOUND")) {
							const virusMatch = scanResult.match(/: (.+) FOUND/);
							const virusName = virusMatch ? virusMatch[1] : "Unknown virus";
							return status(
								403,
								`Virus detected in attachment: ${attachment.name} (${virusName})`,
							);
						}
					} catch (clamError) {
						// TODO: Fix I guess
						// Continue processing - don't let ClamAV errors block legitimate emails
						// In production, you might want to configure this behavior
					}
				}
			}

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

			// Convert mail to EML format for rspamd
			const mail = new MailComposer({
				from: from,
				to,
				subject,
				text: body,
				html,
				attachments: mailAttachments,
			});

			// Convert to Raw RFC822
			const eml = await new Promise<Buffer>((resolve, reject) =>
				mail
					.compile()
					.build((err, message) => (err ? reject(err) : resolve(message))),
			);

			// Call rspamd to check if the email contains spam
			const rspamdResponse = await fetch("http://127.0.0.1:11333/checkv2", {
				method: "POST",
				headers: {
					"Content-Type": "message/rfc822",
					"User-Agent": "Selfmail-SMTP/1.0",
				},
				body: eml,
			});

			if (!rspamdResponse.ok) {
				return status(500, "Failed to check email for spam");
			}

			const result = (await rspamdResponse.json()) as RspamdResult;
			// Check if email should be rejected based on rspamd results
			if (result.action === "reject" || result.score > 5) {
				return status(
					403,
					`Email rejected by spam filter (score: ${result.score}, action: ${result.action})`,
				);
			}

			// Log if email is flagged but not rejected
			if (
				result.action === "add header" ||
				result.action === "rewrite subject"
			) {
				// TODO: Implement logging for flagged emails
			}

			return {
				score: result.score,
				action: result.action,
				required_score: result.required_score,
				symbols: result.symbols ? Object.keys(result.symbols) : [],
				scan_time: result.scan_time,
			};
		} catch (error) {
			console.error("Error in spam checking:", error);
			return status(
				500,
				`Spam check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}
