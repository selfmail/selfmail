// smtp server for receiving and sending emails

import { SMTPServer } from "smtp-server";

const server = new SMTPServer({
    onData(stream, session, callback) {
        console.log(stream, session, callback)
    },
})

server.listen(2525, () => {
    console.log("SMTP server listening on port 2525")
})