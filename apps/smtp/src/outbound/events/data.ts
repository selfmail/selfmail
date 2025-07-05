import type { SMTPServerSession } from "smtp-server";
import { createOutboundLog } from "../../utils/logs";

const dataLog = createOutboundLog("data");

export async function data(
	stream: NodeJS.ReadableStream,
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	dataLog(`Receiving data from ${session.remoteAddress}`);
	// Here you can process the email data from the stream
	// For example, you might want to save it to a database or send it to another service

	// Call the callback to indicate that processing is complete
	callback();
}
