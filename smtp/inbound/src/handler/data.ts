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
				// Processing the email
				try {
					// Combine all chunks into a single buffer
					const emailBuffer = Buffer.concat(chunks);
					const emailBody = emailBuffer.toString("utf-8");

					console.log(
						`[Data] Received email data: ${totalSize} bytes from ${mailFrom.address}`,
					);

					// Parse basic email information
					const emailInfo = Data.parseEmailHeaders(emailBody);

					// Get client information
					const clientIP = session.remoteAddress || "unknown";
					const clientHostname =
						session.clientHostname || session.hostNameAppearsAs || "unknown";

					// Check with Rspamd for spam analysis
					console.log("[Data] Performing Rspamd spam check");

					const rspamdCheck = await rspamd.checkBody({
						from: mailFrom.address,
						to: rcptTo.map((addr) => addr.address),
						subject: emailInfo.subject,
						body: emailBody,
						ip: clientIP !== "unknown" ? clientIP : undefined,
						helo: clientHostname !== "unknown" ? clientHostname : undefined,
					});

					console.log(
						`[Data] Rspamd check result - Action: ${rspamdCheck.action}, Score: ${rspamdCheck.score}/${rspamdCheck.required_score}`,
					);

					// Update spam score in session
					session.meta.spamScore =
						(session.meta.spamScore || 0) + rspamdCheck.score;

					// Handle Rspamd action
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

					// Store Rspamd results in session for further processing
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

					// Log spam score and actions
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

					// Store email data in session for further processing (e.g., saving to database)
					// biome-ignore lint/suspicious/noExplicitAny: extending envelope with email data
					(session.envelope as any).emailData = {
						raw: emailBody,
						size: totalSize,
						subject: emailInfo.subject,
						messageId: emailInfo.messageId,
						date: emailInfo.date,
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

					// Build acceptance message based on Rspamd action
					let acceptanceMessage = "250 2.0.0 Message accepted for delivery";

					if (rspamdCheck.action === "add header") {
						acceptanceMessage = `250 2.0.0 Message accepted for delivery (spam score: ${rspamdCheck.score.toFixed(1)})`;
					} else if (rspamdCheck.action === "rewrite subject") {
						acceptanceMessage =
							"250 2.0.0 Message accepted for delivery (subject modified due to spam score)";
					} else if (
						rspamdCheck.score > 0 &&
						rspamdCheck.score < rspamdCheck.required_score
					) {
						acceptanceMessage = `250 2.0.0 Message accepted for delivery (clean, score: ${rspamdCheck.score.toFixed(1)}/${rspamdCheck.required_score})`;
					}

					console.log(
						`[Data] Sending acceptance message: ${acceptanceMessage}`,
					);

					// TODO: add email to queue

					// Accept the email with message
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

	/**
	 * Parse basic email headers from the raw email body
	 */
	private static parseEmailHeaders(emailBody: string): {
		subject?: string;
		messageId?: string;
		date?: string;
	} {
		const lines = emailBody.split("\r\n");
		const result: { subject?: string; messageId?: string; date?: string } = {};

		for (const line of lines) {
			// Stop at empty line (end of headers)
			if (line.trim() === "") {
				break;
			}

			// Parse Subject
			if (line.toLowerCase().startsWith("subject:")) {
				result.subject = line.substring(8).trim();
			}

			// Parse Message-ID
			if (line.toLowerCase().startsWith("message-id:")) {
				result.messageId = line.substring(11).trim();
			}

			// Parse Date
			if (line.toLowerCase().startsWith("date:")) {
				result.date = line.substring(5).trim();
			}
		}

		return result;
	}
}
