import type { SMTPServerAddress, SMTPServerSession } from "smtp-server";
import { client } from "@/lib/client";

// 2. Handling function
export async function handleMailFrom(
	address: SMTPServerAddress,
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	const res = await client.inbound["mail-from"].post({
		from: address.address,
	});

	if (res.status !== 200) {
		return callback(new Error("Failed to handle mail from address"));
	}

	return callback(null); // continue
}
