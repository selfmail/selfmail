/**
 * Rspamd spam filtering client
 * Provides methods for connection and email body spam checks
 */

export interface RspamdConfig {
	host: string;
	port: number;
	timeout?: number;
}

export interface RspamdConnectionCheckParams {
	ip: string;
	helo?: string;
}

export interface RspamdBodyCheckParams {
	from: string;
	to: string[];
	subject?: string;
	body: string;
	ip?: string;
	helo?: string;
}

export interface RspamdResponse {
	action:
		| "reject"
		| "add header"
		| "rewrite subject"
		| "greylist"
		| "no action";
	score: number;
	required_score: number;
	symbols: Record<string, { score: number; options?: string[] }>;
	message_id?: string;
	subject?: string;
}

export interface RspamdConnectionResult {
	allowed: boolean;
	action: string;
	score: number;
	reason?: string;
	symbols?: Record<string, { score: number; options?: string[] }>;
}

export interface RspamdBodyResult {
	allowed: boolean;
	action: string;
	score: number;
	required_score: number;
	reason?: string;
	symbols?: Record<string, { score: number; options?: string[] }>;
	rewriteSubject?: string;
}

export class RspamdClient {
	private config: Required<RspamdConfig>;
	private baseUrl: string;

	constructor(config: RspamdConfig) {
		this.config = {
			host: config.host,
			port: config.port,
			timeout: config.timeout ?? 5000,
		};
		this.baseUrl = `http://${this.config.host}:${this.config.port}`;
	}

	/**
	 * Check if a client connection should be allowed based on IP and HELO
	 * Uses Rspamd's check endpoint for early connection filtering
	 * This is called during the initial SMTP connection, before MAIL FROM command
	 */
	async checkConnection(
		params: RspamdConnectionCheckParams,
	): Promise<RspamdConnectionResult> {
		try {
			const headers: Record<string, string> = {
				"Content-Type": "text/plain",
				IP: params.ip,
			};

			if (params.helo) {
				headers.Helo = params.helo;
			}

			// For connection checks, we send minimal data (just IP and HELO)
			// No sender/recipient information is available yet at this stage
			const body = "";

			const controller = new AbortController();
			const timeoutId = setTimeout(
				() => controller.abort(),
				this.config.timeout,
			);

			try {
				const response = await fetch(`${this.baseUrl}/checkv2`, {
					method: "POST",
					headers,
					body,
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new Error(
						`Rspamd connection check failed: ${response.status} ${response.statusText}`,
					);
				}

				const result = (await response.json()) as RspamdResponse;

				return {
					allowed:
						result.action === "no action" || result.action === "add header",
					action: result.action,
					score: result.score,
					symbols: result.symbols,
					reason: this.buildReasonFromSymbols(result.symbols),
				};
			} finally {
				clearTimeout(timeoutId);
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === "AbortError") {
					throw new Error("Rspamd connection check timed out");
				}
				throw new Error(`Rspamd connection check error: ${error.message}`);
			}
			throw error;
		}
	}

	/**
	 * Check email body for spam after DATA command
	 * Performs comprehensive spam analysis on the complete email
	 */
	async checkBody(params: RspamdBodyCheckParams): Promise<RspamdBodyResult> {
		try {
			const headers: Record<string, string> = {
				"Content-Type": "message/rfc822",
				From: params.from,
				Rcpt: params.to.join(", "),
			};

			if (params.ip) {
				headers.IP = params.ip;
			}

			if (params.helo) {
				headers.Helo = params.helo;
			}

			if (params.subject) {
				headers.Subject = params.subject;
			}

			// Build email message in RFC822 format
			const emailMessage = this.buildEmailMessage(params);

			const controller = new AbortController();
			const timeoutId = setTimeout(
				() => controller.abort(),
				this.config.timeout,
			);

			try {
				const response = await fetch(`${this.baseUrl}/checkv2`, {
					method: "POST",
					headers,
					body: emailMessage,
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new Error(
						`Rspamd body check failed: ${response.status} ${response.statusText}`,
					);
				}

				const result = (await response.json()) as RspamdResponse;

				return {
					allowed:
						result.action === "no action" ||
						result.action === "add header" ||
						result.action === "rewrite subject",
					action: result.action,
					score: result.score,
					required_score: result.required_score,
					symbols: result.symbols,
					reason: this.buildReasonFromSymbols(result.symbols),
					rewriteSubject:
						result.action === "rewrite subject" ? result.subject : undefined,
				};
			} finally {
				clearTimeout(timeoutId);
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === "AbortError") {
					throw new Error("Rspamd body check timed out");
				}
				throw new Error(`Rspamd body check error: ${error.message}`);
			}
			throw error;
		}
	}

	/**
	 * Build a proper RFC822 email message from parameters
	 */
	private buildEmailMessage(params: RspamdBodyCheckParams): string {
		const headers: string[] = [];

		headers.push(`From: ${params.from}`);
		headers.push(`To: ${params.to.join(", ")}`);

		if (params.subject) {
			headers.push(`Subject: ${params.subject}`);
		}

		headers.push(`Date: ${new Date().toUTCString()}`);
		headers.push("MIME-Version: 1.0");
		headers.push("Content-Type: text/plain; charset=utf-8");

		// Join headers and add body
		return `${headers.join("\r\n")}\r\n\r\n${params.body}`;
	}

	/**
	 * Build a human-readable reason from Rspamd symbols
	 */
	private buildReasonFromSymbols(
		symbols?: Record<string, { score: number; options?: string[] }>,
	): string | undefined {
		if (!symbols) return undefined;

		// Get top scoring symbols
		const topSymbols = Object.entries(symbols)
			.filter(([_, data]) => data.score > 0)
			.sort((a, b) => b[1].score - a[1].score)
			.slice(0, 3)
			.map(([name]) => name);

		return topSymbols.length > 0 ? topSymbols.join(", ") : undefined;
	}

	/**
	 * Test connection to Rspamd server
	 */
	async ping(): Promise<boolean> {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(
				() => controller.abort(),
				this.config.timeout,
			);

			try {
				const response = await fetch(`${this.baseUrl}/ping`, {
					method: "GET",
					signal: controller.signal,
				});

				clearTimeout(timeoutId);
				return response.ok;
			} finally {
				clearTimeout(timeoutId);
			}
		} catch {
			return false;
		}
	}
}
