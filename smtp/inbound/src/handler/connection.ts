import type { SMTPServerSession } from "smtp-server";
import { rspamd } from "../lib/rspamd";
import type { Callback } from "../types";

export abstract class Connection {
	// List of private IP ranges (RFC1918) that should be rejected unless whitelisted
	static readonly PRIVATE_IP_RANGES = [
		/^10\./,
		/^172\.(1[6-9]|2[0-9]|3[0-1])\./,
		/^192\.168\./,
		/^127\./,
		/^169\.254\./,
		/^::1$/,
		/^fe80:/,
		/^fc00:/,
		/^fd00:/,
	];

	// Whitelisted IPs that should always be allowed
	static readonly WHITELISTED_IPS = ["127.0.0.1", "::1"];

	static async init(
		session: SMTPServerSession,
		callback: Callback,
	): Promise<ReturnType<Callback>> {
		try {
			if (!session.remoteAddress) {
				console.warn("[Connection] Rejected: No remote address");
				return callback(new Error("Connection rejected: No remote address"));
			}

			const clientIP = session.remoteAddress;
			const clientHostname =
				session.clientHostname || session.hostNameAppearsAs || "unknown";

			console.log(
				`[Connection] New connection from IP: ${clientIP}, Hostname: ${clientHostname}`,
			);

			// Check if the ip is whitelisted
			if (Connection.isWhitelisted(clientIP)) {
				console.log(`[Connection] Whitelisted IP: ${clientIP}`);
				return callback();
			}

			// Check for private/internal IPs (security measure)
			if (
				Connection.isPrivateIP(clientIP) &&
				!Connection.isWhitelisted(clientIP)
			) {
				console.warn(
					`[Connection] Rejected: Private IP address not whitelisted: ${clientIP}`,
				);
				return callback(
					new Error(
						"Connection rejected: Connections from private networks are not allowed",
					),
				);
			}

			// Validate HELO/EHLO hostname format
			if (clientHostname && !Connection.isValidHostname(clientHostname)) {
				console.warn(
					`[Connection] Warning: Invalid HELO/EHLO hostname: ${clientHostname}`,
				);
				// Log but don't reject - some legitimate servers have poor HELO
			}

			// Check with Rspamd for spam/reputation checks
			try {
				const rspamdResult = await rspamd.checkConnection({
					ip: clientIP,
					helo: clientHostname !== "unknown" ? clientHostname : undefined,
				});

				console.log(
					`[Connection] Rspamd check result - Action: ${rspamdResult.action}, Score: ${rspamdResult.score}`,
				);

				if (!rspamdResult.allowed) {
					console.warn(
						`[Connection] Rejected by Rspamd - Action: ${rspamdResult.action}, Reason: ${rspamdResult.reason || "Unknown"}`,
					);
					return callback(
						new Error(
							`Connection rejected: ${rspamdResult.reason || "Spam protection triggered"}`,
						),
					);
				}

				// Log if there are any suspicious symbols but connection is allowed
				if (rspamdResult.score > 0) {
					console.warn(
						`[Connection] Warning: Connection allowed but has elevated spam score: ${rspamdResult.score} (${rspamdResult.reason || "N/A"})`,
					);
				}
			} catch (rspamdError) {
				// Log error but allow connection if Rspamd is down
				console.error(
					`[Connection] Rspamd check failed: ${rspamdError instanceof Error ? rspamdError.message : "Unknown error"}`,
				);
				console.warn(
					`[Connection] Allowing connection ${clientIP} despite Rspamd failure (fail-open policy)`,
				);
			}

			console.log(`[Connection] Connection accepted from ${clientIP}`);
			return callback();
		} catch (error) {
			console.error(
				`[Connection] Unexpected error during connection check: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			// Fail-open: allow connection on unexpected errors
			return callback();
		}
	}

	static isWhitelisted(ip: string): boolean {
		return Connection.WHITELISTED_IPS.includes(ip);
	}

	static isPrivateIP(ip: string): boolean {
		return Connection.PRIVATE_IP_RANGES.some((pattern) => pattern.test(ip));
	}

	/**
	 * Should be a valid FQDN or IP address
	 */
	static isValidHostname(hostname: string): boolean {
		if (!hostname || hostname === "unknown") {
			return false;
		}

		// Check if it's an IP address (IPv4 or IPv6)
		const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
		const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

		if (ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname)) {
			return true;
		}

		// Check if it's a valid FQDN
		// - Must contain at least one dot
		// - Must not start or end with a dot or hyphen
		// - Must contain valid characters (alphanumeric, dots, hyphens)
		const fqdnPattern = /^(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.?$/;

		return fqdnPattern.test(hostname) && hostname.includes(".");
	}
}
