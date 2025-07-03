import type { SMTPServerOptions } from "smtp-server";

const outbund: SMTPServerOptions = {
	name: "Selfmail Outbound SMTP Server",
	secure: true,
	authOptional: false,
	onConnect: (session, callback) => {
		console.log(`Connection attempt from ${session.remoteAddress}`);
		callback();
	},
	onAuth: (auth, session, callback) => {
		console.log(`Authentication attempt for user: ${auth.username}`);
		return callback(undefined, {});
	},
	onMailFrom: (address, session, callback) => {
		console.log(`Mail from: ${address.address}`);
		return callback();
	},
	onRcptTo: (address, session, callback) => {
		console.log(`Recipient to: ${address.address}`);
		return callback();
	},
};

export default outbund;
