import type { SMTPServerSession } from "smtp-server";
import type { Callback } from "../types";

interface RspamdResponse {
	is_spam: boolean;
	score: number;
	required_score: number;
	action: "reject" | "add header" | "greylist" | "no action";
	symbols: Record<string, { score: number; description?: string }>;
	messages?: Record<string, string>;
}

interface SpamCheckResult {
	accept: boolean;
	score: number;
	action: string;
	symbols?: Record<string, { score: number; description?: string }>;
}

export class Connection {
	private static readonly RSPAMD_URL =
		process.env.RSPAMD_URL || "http://127.0.0.1:11334";
	private static readonly RSPAMD_TIMEOUT = 5000; // 5 seconds
	private static readonly SPAM_REJECT_THRESHOLD = 15; // Reject emails with score >= 15

	static async init(session: SMTPServerSession, callback: Callback) {
		try {
			// Check rate limiting first
			const limited = await Connection.ratelimit(session.remoteAddress);
			if (!limited.accept) {
				return callback(new Error("Too many connections from your IP address"));
			}

			// Perform spam check during connection phase
			const spamCheck = await Connection.spamCheck(session);
			if (!spamCheck.accept) {
				return callback(
					new Error(
						`Connection rejected: ${spamCheck.action} (score: ${spamCheck.score})`,
					),
				);
			}

			// Store spam score in session for later use
			// biome-ignore lint/suspicious/noExplicitAny: SMTPServerSession envelope doesn't include our custom properties
			(session.envelope as any).spamScore = spamCheck.score;
			// biome-ignore lint/suspicious/noExplicitAny: SMTPServerSession envelope doesn't include our custom properties
			(session.envelope as any).spamAction = spamCheck.action;

			return callback();
		} catch (error) {
			console.error("Connection initialization error:", error);
			return callback(
				new Error("Internal server error during connection setup"),
			);
		}
	}

	static async spamCheck(session: SMTPServerSession): Promise<SpamCheckResult> {
		try {
			const checkUrl = `${Connection.RSPAMD_URL}/checkv2`;

			// Prepare the payload for rspamd
			const payload = {
				ip: session.remoteAddress || "unknown",
				helo: session.hostNameAppearsAs || "",
				from: "", // No sender yet at connection time
				rcpt: [], // No recipients yet at connection time
				subject: "", // No subject yet at connection time
				user: session.user || "",
				pass_all: "1", // Check all rules
				deliver_to: "reject", // We want to know what action rspamd would take
			};

			const controller = new AbortController();
			const timeoutId = setTimeout(
				() => controller.abort(),
				Connection.RSPAMD_TIMEOUT,
			);

			const response = await fetch(checkUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"User-Agent": "Selfmail-SMTP-Inbound/1.0",
				},
				body: JSON.stringify(payload),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				console.warn(
					`Rspamd check failed with status ${response.status}: ${response.statusText}`,
				);

				// If rspamd is down, we'll allow the connection but log it
				return {
					accept: true,
					score: 0,
					action: "no action (rspamd unavailable)",
				};
			}

			const data = (await response.json()) as RspamdResponse;

			// Determine if we should accept the connection
			const shouldAccept = Connection.shouldAcceptConnection(data);

			return {
				accept: shouldAccept,
				score: data.score || 0,
				action: data.action || "no action",
				symbols: data.symbols,
			};
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				console.warn("Rspamd check timed out");
			} else {
				console.error("Rspamd check error:", error);
			}

			// If there's an error with rspamd, we'll allow the connection
			// but this should be logged and monitored
			return {
				accept: true,
				score: 0,
				action: "no action (error)",
			};
		}
	}

	private static shouldAcceptConnection(
		rspamdResponse: RspamdResponse,
	): boolean {
		const { score, action, is_spam } = rspamdResponse;

		// Always reject if rspamd explicitly says to reject
		if (action === "reject") {
			return false;
		}

		// Reject if score is above our threshold
		if (score >= Connection.SPAM_REJECT_THRESHOLD) {
			return false;
		}

		// For very high spam scores, reject even if action isn't "reject"
		if (is_spam && score > 10) {
			return false;
		}

		return true;
	}

	static async ratelimit(_remoteAddress: string): Promise<{ accept: boolean }> {
		// TODO: Implement proper rate limiting
		// This could use Redis, in-memory cache, or database
		// For now, we'll accept all connections
		return { accept: true };
	}
}
