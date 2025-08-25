import type { SMTPServerAddress, SMTPServerSession } from "smtp-server";
import { client } from "@/lib/client";
import { createInboundLog } from "@/utils/logs";

const log = createInboundLog("rcpt-to");

// 3. Handling function
export async function handleRcptTo(
	address: SMTPServerAddress,
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	log(
		`Recipient address: ${address.address}, session ID: ${session.id}, remote address: ${session.remoteAddress || "unknown"}`,
	);

	if (!session.envelope.mailFrom) {
		log(`No MAIL FROM address set for session ID: ${session.id}`);
		return callback(new Error("No MAIL FROM address set"));
	}

	const res = await client.inbound["rcpt-to"].post({
		to: address.address,
		mailFrom: session.envelope.mailFrom.address,
	});

	if (res.error) {
		log(`Failed to handle recipient address: ${address.address}`);
		return callback(new Error("Failed to handle recipient address"));
	}

	return callback(null);
}
