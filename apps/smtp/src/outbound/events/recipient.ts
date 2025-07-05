import type { SMTPServerAddress, SMTPServerSession } from "smtp-server";
import { createOutboundLog } from "../../utils/logs";

const recipientLog = createOutboundLog("recipient");

export async function recipient(
	address: SMTPServerAddress,
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	recipientLog(`Recipient address: ${address.address}`);

	return callback();
}
