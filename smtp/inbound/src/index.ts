import { SMTPServer } from "smtp-server";
import { validateConnection } from "./events/connection";

const server = new SMTPServer({
  disabledCommands: ["STARTTLS", "AUTH"],
  banner: "Welcome to Selfmail SMTP Server",
  logger: process.env.NODE_ENV === "development",

  onConnect: validateConnection,
});

server.listen(25, () => {
  console.log("SMTP Server is listening on port 25");
});
