import { resolve4 } from "node:dns/promises";
import type { SMTPServerSession } from "smtp-server";
import { posthog } from "../../lib/posthog.js";
import { createOutboundLog } from "../../utils/logs.js";

const connectionLog = createOutboundLog("connection");

export async function connection(
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	posthog.capture({
		distinctId: session.remoteAddress,
		event: "outbound_connection",
		properties: {
			remoteAddress: session.remoteAddress,
			secure: session.secure,
			timestamp: new Date().toISOString(),
		},
	});

	// do not accept connections from localhost to prevent spam, only in prod mode
	if (
		globalThis.devmode &&
		(session.remoteAddress === "127.0.0.1" || session.remoteAddress === "::1")
	) {
		connectionLog("Connection from localhost is not allowed.");
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
			connectionLog(
				"IP not listed in DNSBL (Spamhaus), proceeding with connection.",
			);
		} else {
			console.error("[OUTBOUND] Error checking DNSBL (Spamhaus):", e);
			return callback(new Error("Error checking DNSBL (Spamhaus)"));
		}
	}

	posthog.capture({
		distinctId: session.remoteAddress,
		event: "successfull_outbound_connection",
		properties: {
			remoteAddress: session.remoteAddress,
			secure: session.secure,
			timestamp: new Date().toISOString(),
		},
	});

	return callback();
}
