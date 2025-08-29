import { Logs } from "services/logs";
import type { SMTPServerAddress, SMTPServerSession } from "smtp-server";
import { client } from "@/lib/client";

// 3. Handling function
export async function handleRcptTo(
	address: SMTPServerAddress,
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	if (!session.envelope.mailFrom) {
		return callback(new Error("No MAIL FROM address set"));
	}

	const res = await client.inbound["rcpt-to"].post({
		to: address.address,
		mailFrom: session.envelope.mailFrom.address,
	});

	if (res.error) {
		return callback(new Error("Failed to handle recipient address"));
	}

	Logs.log(`Recipient ${address.address} accepted`);

	return callback(null);
}
