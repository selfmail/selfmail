import { SMTPServer } from "smtp-server";

export const inboundServer = new SMTPServer({
	// For incoming emails (port 25), authentication is optional
	authOptional: true,
	disabledCommands: ["AUTH", "STARTTLS"],

	// Callbacks
	onConnect(session, callback) {
		console.log(`Verbindung von ${session.remoteAddress}`);
		return callback(); // Akzeptiert die Verbindung
	},

	onMailFrom(address, session, callback) {
		console.log(
			`MAIL FROM: ${address.address} (from ${session.remoteAddress})`,
		);

		// Check if someone is trying to send FROM a selfmail.app address
		if (address.address.endsWith("@selfmail.app")) {
			// Sending FROM selfmail.app requires authentication
			if (!session.user) {
				console.log(
					`Authentication required for sending from selfmail.app address: ${address.address}`,
				);
				return callback(
					new Error(
						"Authentication required to send from @selfmail.app addresses",
					),
				);
			}

			// Ensure the authenticated user matches the sender address
			if (session.user !== address.address) {
				console.log(
					`User ${session.user} tried to send from ${address.address}`,
				);
				return callback(
					new Error("You can only send emails from your own email address"),
				);
			}

			console.log(
				`Authenticated user ${session.user} sending from their own address`,
			);
		} else {
			// External sender - no authentication required for incoming emails
			console.log(
				`Accepting incoming email from external sender: ${address.address}`,
			);
		}

		return callback(); // Accept the sender address
	},

	onRcptTo(address, session, callback) {
		console.log(`RCPT TO: ${address.address} (from ${session.remoteAddress})`);

		// If user is authenticated (sending FROM selfmail.app), allow sending to any address
		if (session.user) {
			console.log(
				`Authenticated selfmail.app user ${session.user} sending to: ${address.address}`,
			);
			return callback(); // Allow authenticated users to send to any address
		}
		// TODO: Validate that the recipient actually exists in your database
		console.log(
			`Accepting incoming email for selfmail.app user: ${address.address}`,
		);

		return callback(); // Accept the recipient address
	},

	onData(stream, session, callback) {
		console.log(`Empfange Daten für E-Mail (von ${session.remoteAddress})`);
		let emailContent = "";
		stream.on("data", (chunk) => (emailContent += chunk.toString()));
		stream.on("end", () => {
			console.log("E-Mail Inhalt:");
			console.log(emailContent);

			console.log("E-Mail wurde empfangen und verarbeitet.");
			return callback(); // Signalisiert dem Client, dass die E-Mail empfangen wurde
		});
	},

	onClose(session) {
		console.log(`Verbindung von ${session.remoteAddress} geschlossen`);
	},
});
