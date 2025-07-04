import { resolve4 } from "node:dns/promises";
import type { SMTPServerSession } from "smtp-server";
import z from "zod";
import { posthog } from "../../lib/posthog.js";

export async function connection(
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	posthog.capture({
		distinctId: session.id,
		event: "outbound_connection",
		properties: {
			remoteAddress: session.remoteAddress,
			secure: session.secure,
			timestamp: new Date().toISOString(),
		},
	});

	// do not accept connections from localhost to prevent spam
	if (session.remoteAddress === "127.0.1" || session.remoteAddress === "::1") {
		console.log("[OUTBOUND] Connection attempt from localhost, rejecting.");
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
			console.log(
				"[OUTBOUND] IP not listed in DNSBL (Spamhaus), proceeding with connection.",
			);
		} else {
			console.error("[OUTBOUND] Error checking DNSBL (Spamhaus):", e);
			return callback(new Error("Error checking DNSBL (Spamhaus)"));
		}
	}

	return callback();
}
