import { resolve4 } from "node:dns/promises";
import { Analytics } from "services/analytics";
import { Logs } from "services/logs";
import { Ratelimit } from "services/ratelimit";
import type { SMTPServerSession } from "smtp-server";

export async function connection(
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	const limit = await Ratelimit.limit(
		`smtp-outbound-connection-${session.remoteAddress}`,
	);

	if (!limit.success) {
		return callback(new Error("Rate limit exceeded"));
	}

	Analytics.trackEvent("smtp_outbound_connection_attempt", {
		remoteAddress: session.remoteAddress,
		secure: session.secure,
		timestamp: new Date().toISOString(),
	});

	if (
		process.env.NODE_ENV === "production" &&
		(session.remoteAddress === "127.0.0.1" || session.remoteAddress === "::1")
	) {
		// do not accept connections from localhost to prevent spam, only in prod mode
		Logs.log("Connection from localhost is not allowed.");
		return callback(new Error("Connection from localhost is not allowed"));
	}

	const reversedIp = session.remoteAddress.split(".").reverse().join(".");
	const query = `${reversedIp}.zen.spamhaus.org`;

	try {
		await resolve4(query);
		return callback(new Error("IP listed in DNSBL (Spamhaus)."));
	} catch (e) {
		if (e instanceof Error && e.message.includes("ENOTFOUND")) {
			// Not listed, continue
			Logs.log(
				"IP not listed in DNSBL (Spamhaus), proceeding with connection.",
			);
		} else {
			Logs.log(`Error checking DNSBL (Spamhaus): ${e}`);
			return callback(new Error("Error checking DNSBL (Spamhaus)"));
		}
	}
	Analytics.trackEvent("successful_outbound_connection", {
		remoteAddress: session.remoteAddress,
		secure: session.secure,
		timestamp: new Date().toISOString(),
	});

	return callback();
}
