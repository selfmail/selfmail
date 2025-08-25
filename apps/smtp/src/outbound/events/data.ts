import type { SMTPServerSession } from "smtp-server";
import { createOutboundLog } from "../../utils/logs";

const dataLog = createOutboundLog("data");

export async function data(
  stream: NodeJS.ReadableStream,
  session: SMTPServerSession,
  callback: (err?: Error | null) => void,
): Promise<void> {
  dataLog(`Receiving data from ${session.remoteAddress}`);
  callback();
}
