import fetch from "node-fetch";
import { Connection, Next } from "../../types/parameter.js";
import { This } from "../../types/this.js";

exports.hook_rcpt = async function (this: This, next: Next, connection: Connection) {
    const rcpt_to = connection.transaction.rcpt_to.map(rcpt => rcpt.address());
    const rcpt = rcpt_to[0].split("@")[0]
    this.loginfo(rcpt)

    const res = await fetch("http://localhost:4001/api/check-address", {
        method: "POST",
        body: JSON.stringify({
            email: `${rcpt}@trash.company`
        })
    })

    if (!res.ok) {
        this.logerror(`Recipient ${rcpt_to} is not a valid recipient!`)
        return next(DENY)
    }

    next(OK)
}

exports.plugin = {
    name: "check_address"
}