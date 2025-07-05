import { describe, expect, test } from "bun:test";
import nodemailer from "nodemailer";

describe("SMTP Outbund Tests", () => {
	const transport = nodemailer.createTransport({
		host: "localhost",
		port: 587,
		secure: false,

		auth: {
			user: "henri@selfmail.app",
			pass: "selfmail",
		},
		tls: {
			rejectUnauthorized: false,
		},
	});

	test("Verification of SMTP Server", async () => {
		const verify = await transport.verify();

		expect(verify).toBeDefined();
		expect(verify).toBe(true);
	});
});
