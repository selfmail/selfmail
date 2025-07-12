import type { SMTPServerSession } from "smtp-server";
import { client } from "@/lib/client";
import { createInboundLog } from "@/utils/logs";
import { inboundRatelimiting } from "../utils/ratelimiting";

const log = createInboundLog("connection");
export async function handleConnection(
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	const ratelimit = await inboundRatelimiting.limit(
		session.remoteAddress || "unknown",
	);

	if (!ratelimit.success) {
		log(
			`Rate limit exceeded for connection with identifier: ${session.remoteAddress || "unknown"}`,
		);
		return callback(new Error("Rate limit exceeded"));
	}

	const res = await client.inbound.connection.get({
		ip: session.remoteAddress || "unknown",
		hostname: session.clientHostname || "unknown",
	});

	if (res.status !== 200) {
		return callback(new Error("Failed to handle connection"));
	}

	log(
		`Connection established with identifier: ${session.remoteAddress || "unknown"}`,
	);

	return callback(null);
}
