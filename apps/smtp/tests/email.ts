import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
	host: "localhost",
	port: 587,

	auth: {
		user: "henri@selfmail.app",
		method: "PLAIN",
		pass: "selfmail_password", // Ensure this matches your SMTP server password
	},

	secure: false, // Use STARTTLS
	tls: {
		rejectUnauthorized: false, // Allow self-signed certificates for testing
	},

	requireTLS: true,

	authMethod: "PLAIN",
	logger: true, // Enable logging for debugging
	debug: true, // Enable debug output
});
const mail = await transport.sendMail({
	from: "Henri <henri@selfmail.app>",
	to: "henri.gg@icloud.com",
	subject: "Test Email from selfmail.app",
	text: "This is a test email sent through the selfmail.app SMTP server.",
	html: "<p>This is a <strong>test email</strong> sent through the selfmail.app SMTP server.</p>",
});

console.log("Email sent successfully:", mail.messageId);
