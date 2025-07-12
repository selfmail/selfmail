import type { SMTPServerAddress, SMTPServerSession } from "smtp-server";
import { client } from "@/lib/client";
import { createInboundLog } from "@/utils/logs";

const log = createInboundLog("mail-from");

export async function handleMailFrom(
	address: SMTPServerAddress,
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	log(
		`Mail from address: ${address.address}, session ID: ${session.id}, remote address: ${session.remoteAddress || "unknown"}`,
	);

	const res = await client.inbound["mail-from"].get({
		from: address.address,
	});

	if (res.status !== 200) {
		log(`Failed to handle mail from address: ${address.address}`);
		return callback(new Error("Failed to handle mail from address"));
	}

	return callback(null); // Call the callback with no error to continue processing
}
