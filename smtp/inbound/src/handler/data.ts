import { db } from "database";
import { simpleParser } from "mailparser";
import { saveEmail } from "smtp-queue";
import type { SMTPServerDataStream } from "smtp-server";
import { rspamd } from "../lib/rspamd";
import type { Callback } from "../types";
import type { ExtendedSession } from "../types/session";

export abstract class Data {
	static async init(
		stream: SMTPServerDataStream,
		session: ExtendedSession,
		callback: Callback,
	): Promise<ReturnType<Callback>> {
		try {
			// Get sender information from session
			const mailFrom = session.envelope?.mailFrom;
			if (!mailFrom) {
				console.error("[Data] No MAIL FROM information in session");
				return callback(new Error("DATA rejected: Missing sender information"));
			}

			// Get recipient information from session envelope
			const rcptTo = session.envelope?.rcptTo;
			if (!rcptTo || rcptTo.length === 0) {
				console.error("[Data] No RCPT TO information in session");
				return callback(
					new Error("DATA rejected: Missing recipient information"),
				);
			}

			// Read email data from stream
			const chunks: Buffer[] = [];
			let totalSize = 0;
			const maxSize = 25 * 1024 * 1024; // 25MB limit

			stream.on("data", (chunk: Buffer) => {
				totalSize += chunk.length;

				if (totalSize > maxSize) {
					stream.destroy();
					console.error(
						`[Data] Email size exceeded limit: ${totalSize} bytes > ${maxSize} bytes`,
					);
					return callback(
						new Error("DATA rejected: Email size exceeds maximum allowed size"),
					);
				}

				chunks.push(chunk);
			});

			stream.on("error", (error) => {
				console.error(`[Data] Stream error: ${error.message}`);
				return callback(
					new Error(`DATA rejected: Stream error - ${error.message}`),
				);
			});

			stream.on("end", async () => {
				try {
					const emailBuffer = Buffer.concat(chunks);
					const emailBody = emailBuffer.toString("utf-8");

					console.log(
						`[Data] Received email data: ${totalSize} bytes from ${mailFrom.address}`,
					);

					const parsed = await simpleParser(emailBuffer);

					const clientIP = session.remoteAddress || "unknown";
					const clientHostname =
						session.clientHostname || session.hostNameAppearsAs || "unknown";

					console.log("[Data] Performing Rspamd spam check");

					const rspamdCheck = await rspamd.checkBody({
						from: mailFrom.address,
						to: rcptTo.map((addr) => addr.address),
						subject: parsed.subject || "(no subject)",
						body: emailBody,
						ip: clientIP !== "unknown" ? clientIP : undefined,
						helo: clientHostname !== "unknown" ? clientHostname : undefined,
					});

					console.log(
						`[Data] Rspamd check result - Action: ${rspamdCheck.action}, Score: ${rspamdCheck.score}/${rspamdCheck.required_score}`,
					);

					session.meta.spamScore =
						(session.meta.spamScore || 0) + rspamdCheck.score;

					if (rspamdCheck.action === "reject") {
						console.warn(
							`[Data] Rejected by Rspamd - Score: ${rspamdCheck.score}, Reason: ${rspamdCheck.reason || "Spam detected"}`,
						);
						return callback(
							new Error(
								`DATA rejected: ${rspamdCheck.reason || "Message identified as spam"}`,
							),
						);
					}

					if (rspamdCheck.action === "greylist") {
						console.warn(
							`[Data] Greylisted by Rspamd - Score: ${rspamdCheck.score}`,
						);
						return callback(
							new Error(
								"DATA rejected: Message greylisted, please try again later",
							),
						);
					}

					if (!session.meta) {
						session.meta = { spamScore: 0 };
					}
					// biome-ignore lint/suspicious/noExplicitAny: extending meta with rspamd results
					(session.meta as any).rspamdResult = {
						action: rspamdCheck.action,
						score: rspamdCheck.score,
						required_score: rspamdCheck.required_score,
						symbols: rspamdCheck.symbols,
						rewriteSubject: rspamdCheck.rewriteSubject,
					};

					if (rspamdCheck.action === "add header") {
						console.log(
							`[Data] Adding spam headers - Score: ${rspamdCheck.score}`,
						);
					}

					if (rspamdCheck.action === "rewrite subject") {
						console.log(
							`[Data] Subject rewrite suggested: ${rspamdCheck.rewriteSubject}`,
						);
					}

					// biome-ignore lint/suspicious/noExplicitAny: extending envelope with email data
					(session.envelope as any).emailData = {
						raw: emailBody,
						size: totalSize,
						subject: parsed.subject,
						messageId: parsed.messageId,
						date: parsed.date,
						rspamd: {
							action: rspamdCheck.action,
							score: rspamdCheck.score,
							required_score: rspamdCheck.required_score,
							symbols: rspamdCheck.symbols,
						},
					};

					console.log(
						`[Data] Email accepted from ${mailFrom.address} to ${rcptTo.map((addr) => addr.address).join(", ")}`,
					);
					console.log(
						`[Data] Total spam score: ${session.meta.spamScore}, Rspamd action: ${rspamdCheck.action}`,
					);

					const recipientAddress = await db.address.findUnique({
						where: { email: rcptTo[0]?.address },
					});

					if (!recipientAddress) {
						console.error(
							`[Data] Recipient address not found: ${rcptTo[0]?.address}`,
						);
						return callback(
							new Error("DATA rejected: Recipient address not found"),
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

					const attachments = parsed.attachments?.map(
						(att: {
							filename?: string;
							contentType: string;
							size: number;
							checksum?: string;
							contentDisposition?: string;
							contentId?: string;
						}) => ({
							filename: att.filename,
							contentType: att.contentType,
							size: att.size,
							checksum: att.checksum,
							contentDisposition: att.contentDisposition,
							contentId: att.contentId,
						}),
					);

					const getAddresses = (
						addressObj:
							| { value: Array<{ address?: string; name?: string }> }
							| Array<{ value: Array<{ address?: string; name?: string }> }>
							| undefined,
					): Array<{ address: string; name?: string }> | undefined => {
						if (!addressObj) return undefined;
						if (Array.isArray(addressObj)) {
							return addressObj
								.flatMap((obj) => obj.value)
								.map((addr) => ({
									address: addr.address || "",
									name: addr.name,
								}));
						}
						return addressObj.value.map((addr) => ({
							address: addr.address || "",
							name: addr.name,
						}));
					};

					await saveEmail({
						messageId: parsed.messageId || undefined,
						subject: parsed.subject || "(no subject)",
						date: parsed.date,
						sizeBytes: BigInt(totalSize),
						from: getAddresses(parsed.from) || [{ address: mailFrom.address }],
						to:
							getAddresses(parsed.to) ||
							rcptTo.map((addr) => ({ address: addr.address })),
						cc: getAddresses(parsed.cc),
						bcc: getAddresses(parsed.bcc),
						replyTo: getAddresses(parsed.replyTo),
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
						rawEmail: emailBody,
						addressId: recipientAddress.id,
						contactId: undefined,
						sort: determineSort(),
					});

					return callback(null);
				} catch (error) {
					console.error(
						`[Data] Error processing email: ${error instanceof Error ? error.message : "Unknown error"}`,
					);
					return callback(
						new Error(
							"DATA rejected: Internal server error during email processing",
						),
					);
				}
			});
		} catch (error) {
			console.error(
				`[Data] Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			return callback(
				new Error("DATA rejected: Internal server error during validation"),
			);
		}
	}
}
