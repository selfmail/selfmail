import NodeClam from "clamscan";
import { db } from "database";
import { status } from "elysia";
import MailComposer from "nodemailer/lib/mail-composer";
import { Logs } from "services/logs";
import type { InboundModule } from "./module";
import type { RspamdResult } from "./types";

interface VirusScanResult {
	isInfected: boolean;
	viruses?: string[];
	file?: string;
}

interface SpamCheckResult {
	score: number;
	action: string;
	required_score: number;
	symbols: string[];
	scan_time?: number;
}

export abstract class InboundService {
	/**
	 * Scan attachments for viruses using ClamAV
	 */
	private static async scanAttachmentsForViruses(
		attachments: File[],
	): Promise<VirusScanResult> {
		try {
			const clamscan = await new NodeClam().init({
				removeInfected: false,
				quarantineInfected: false,
				scanLog: null,
				debugMode: false,
				fileList: null,
				scanRecursively: true,
				clamscan: {
					path: "/usr/bin/clamscan",
					scanArchives: true,
					active: true,
				},
				clamdscan: {
					socket: "/var/run/clamav/clamd.ctl",
					host: "127.0.0.1",
					port: 3310,
					timeout: 60000,
					localFallback: true,
					active: true,
				},
			});

			for (const attachment of attachments) {
				const attachmentBuffer = Buffer.from(await attachment.arrayBuffer());
				const tempPath = `/tmp/attachment_${Date.now()}_${attachment.name}`;

				await Bun.write(tempPath, attachmentBuffer);

				try {
					const { isInfected, viruses } = await clamscan.scanFile(tempPath);

					if (isInfected && viruses) {
						Logs.error(
							`Virus detected in attachment ${attachment.name}: ${viruses.join(", ")}`,
						);
						return {
							isInfected: true,
							viruses,
							file: attachment.name,
						};
					}
				} finally {
					// Clean up temp file
					await Bun.write(tempPath, "").catch(() => {});
				}
			}

			return { isInfected: false };
		} catch (error) {
			Logs.error(
				`ClamAV scan failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			// Don't block emails if virus scanning fails
			return { isInfected: false };
		}
	}

	/**
	 * Check email content for spam using Rspamd
	 */
	private static async checkEmailForSpam(
		from: string,
		to: string,
		subject: string,
		body: string,
		html?: string,
		attachments?: File[],
	): Promise<SpamCheckResult> {
		const mailAttachments = attachments
			? await Promise.all(
					attachments.map(async (file) => ({
						filename: file.name,
						content: Buffer.from(await file.arrayBuffer()),
						contentType: file.type,
					})),
				)
			: [];

		const mail = new MailComposer({
			from,
			to,
			subject,
			text: body,
			html,
			attachments: mailAttachments,
		});

		const eml = await new Promise<Buffer>((resolve, reject) =>
			mail
				.compile()
				.build((err, message) => (err ? reject(err) : resolve(message))),
		);

		const rspamdResponse = await fetch("http://127.0.0.1:11333/checkv2", {
			method: "POST",
			headers: {
				"Content-Type": "message/rfc822",
				"User-Agent": "Selfmail-SMTP/1.0",
			},
			body: eml,
		});

		if (!rspamdResponse.ok) {
			throw new Error(
				`Rspamd request failed with status ${rspamdResponse.status}`,
			);
		}

		const result = (await rspamdResponse.json()) as RspamdResult;

		return {
			score: result.score,
			action: result.action,
			required_score: result.required_score,
			symbols: result.symbols ? Object.keys(result.symbols) : [],
			scan_time: result.scan_time,
		};
	}
	/**
	 * Connection handler for new SMTP clients
	 */
	static async handleConnection({
		hostname,
		ip,
	}: InboundModule.ConnectionBody) {
		Logs.log(`Connection received from ${ip} (${hostname})`);
		return {
			valid: true,
		};
	}

	/**
	 * Handle MAIL FROM command
	 */
	static async handleMailFrom({ from }: InboundModule.MailFromBody) {
		if (from.endsWith("@selfmail.app")) {
			throw status(403, "Selfmail addresses are not allowed");
		}

		Logs.log(`Mail from address: ${from}`);

		return {
			valid: true,
		};
	}

	/**
	 * Handle RCPT TO command
	 */

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

		Logs.log(
			`Address found for ${to}, contact ${contact ? "exists" : "will be created"}`,
		);

		return {
			valid: true,
		};
	}

	/**
	 * Handle email data and save to database
	 */
	static async handleData({
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

		if (!contact) {
			Logs.log(`Creating new contact for ${mailFrom} -> ${address.email}`);
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
	/**
	 * Spam and virus checking for incoming emails
	 */
	static async spam({
		body,
		subject,
		html,
		from,
		to,
		attachments,
	}: InboundModule.SpamBody) {
		try {
			if (attachments && attachments.length > 0) {
				const virusScanResult =
					await InboundService.scanAttachmentsForViruses(attachments);

				if (virusScanResult.isInfected) {
					const virusNames =
						virusScanResult.viruses?.join(", ") || "Unknown virus";
					return status(
						403,
						`Virus detected in attachment: ${virusScanResult.file} (${virusNames})`,
					);
				}
			}

			const spamResult = await InboundService.checkEmailForSpam(
				from,
				to,
				subject,
				body,
				html,
				attachments,
			);

			if (spamResult.action === "reject" || spamResult.score > 5) {
				Logs.error(
					`Email rejected by spam filter - Score: ${spamResult.score}, Action: ${spamResult.action}, From: ${from}, To: ${to}`,
				);
				return status(
					403,
					`Email rejected by spam filter (score: ${spamResult.score}, action: ${spamResult.action})`,
				);
			}

			if (
				spamResult.action === "add header" ||
				spamResult.action === "rewrite subject"
			) {
				Logs.log(
					`Email flagged but not rejected - Score: ${spamResult.score}, Action: ${spamResult.action}, From: ${from}, To: ${to}`,
				);
			}

			return spamResult;
		} catch (error) {
			Logs.error(
				`Spam check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			return status(
				500,
				`Spam check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}
