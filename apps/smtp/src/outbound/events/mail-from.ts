import type { SMTPServerAddress, SMTPServerSession } from "smtp-server";
import { createOutboundLog } from "../../utils/logs";

const mailFromLog = createOutboundLog("mail-from");

export async function mailFrom(
	address: SMTPServerAddress,
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	mailFromLog(`Mail from address: ${address.address}`);

	// Here you can add any additional logic for processing the MAIL FROM command
	// For example, you might want to validate the sender's address or log it
	return callback();
}
