import { Logs } from "services/logs";
import type { SMTPServerSession } from "smtp-server";
import { client } from "@/lib/client";
import { Ratelimit } from "@/lib/ratelimit";

export async function handleConnection(
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	const ratelimit = await Ratelimit.limit(
		`inbound-${session.remoteAddress || "unknown"}`,
		{
			windowInSeconds: 60,
			max: 100,
		},
	);

	if (!ratelimit.success) {
		return callback(new Error("Rate limit exceeded"));
	}

	const res = await client.inbound.connection.post({
		ip: session.remoteAddress || "unknown",
		hostname: session.clientHostname || "unknown",
	});

	if (res.status !== 200) {
		return callback(new Error("Failed to handle connection"));
	}

	// TODO: check for possible spam in the ip address of the sender

	Logs.log(
		`Connection accepted with hostname ${session.clientHostname || "unknown"}`,
	);

	return callback(null);
}
