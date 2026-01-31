import { SMTPServer } from "smtp-server";
import { validateConnection } from "./events/connection";
import { validateMailFrom } from "./events/mail-from";
import { validateRcptTo } from "./events/rcpt-to";

const server = new SMTPServer({
  disabledCommands: ["STARTTLS", "AUTH"],
  banner: "Welcome to Selfmail SMTP Server",
  logger: process.env.NODE_ENV === "development",

  onConnect: validateConnection,
  onMailFrom: validateMailFrom,
  onRcptTo: validateRcptTo,
});

server.listen(25, () => {
  console.log("SMTP Server is listening on port 25");
});
