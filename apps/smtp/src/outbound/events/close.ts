import type { SMTPServerSession } from "smtp-server";
import { createOutboundLog } from "../../utils/logs";

export async function close(
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	const closeLog = createOutboundLog("close");
	closeLog(`Closing connection from ${session.remoteAddress}`);
}
