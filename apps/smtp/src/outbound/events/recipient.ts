import { Logs } from "services/logs";
import type { SMTPServerAddress, SMTPServerSession } from "smtp-server";
import { client } from "@/lib/client";

export async function recipient(
	address: SMTPServerAddress,
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	Logs.log(`Recipient address: ${address.address}`);

	const res = await client.outbound["rcpt-to"].post({
		to: address.address,
	});

	if (res.error) {
		Logs.error(`Failed to find recipient address: ${address.address}`);
		return callback(new Error("Recipient address not found"));
	}

	return callback();
}
