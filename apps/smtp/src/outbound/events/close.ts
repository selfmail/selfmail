import type { SMTPServerSession } from "smtp-server";
import { createOutboundLog } from "../../utils/logs";

export async function close(
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	const closeLog = createOutboundLog("close");
	closeLog(`Closing connection from ${session.remoteAddress}`);

	// Here you can add any additional logic for closing the connection
	// For example, you might want to log the session details or clean up resources

	// Call the callback to indicate that the connection is closed
	callback();
}
