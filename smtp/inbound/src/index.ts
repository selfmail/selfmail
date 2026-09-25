import { SMTPServer } from "smtp-server";
import { Connection } from "./events/connection";
import { Data } from "./events/data";
import { MailFrom } from "./events/mail-from";
import { RcptTo } from "./events/rcpt-to";

export const server = new SMTPServer({
  disabledCommands: ["STARTTLS", "AUTH"],
  banner: "Welcome to Selfmail SMTP Server",
  logger: process.env.NODE_ENV === "development",

  onConnect: Connection.init,
  onMailFrom: MailFrom.init,
  onRcptTo: RcptTo.init,
  onData: Data.init,
});

const defaultPort = process.env.NODE_ENV === "test" ? 2525 : 25;
export const SMTP_PORT = Number(process.env.SMTP_PORT ?? defaultPort);

server.listen(SMTP_PORT, () => {
  console.log(`SMTP Server is listening on port ${SMTP_PORT}`);
});
