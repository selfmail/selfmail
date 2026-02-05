import { SMTPServer } from "smtp-server";
import { Connection } from "./events/connection";
import { handleData } from "./events/data";
import { validateMailFrom } from "./events/mail-from";
import { validateRcptTo } from "./events/rcpt-to";

export const server = new SMTPServer({
  disabledCommands: ["STARTTLS", "AUTH"],
  banner: "Welcome to Selfmail SMTP Server",
  logger: process.env.NODE_ENV === "development",

  onConnect: Connection.init,
  onMailFrom: validateMailFrom,
  onRcptTo: validateRcptTo,
  onData: handleData,
});

server.listen(25, () => {
  console.log("SMTP Server is listening on port 25");
});
