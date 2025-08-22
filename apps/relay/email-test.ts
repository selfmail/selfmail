#!/usr/bin/env bun

// Test script for the Selfmail Relay server email sending functionality
// Run with: bun run email-test.ts

const RELAY_URL = "http://localhost:8080";

// Test 1: Send a simple email (will use automatic SMTP detection)
async function testSimpleEmail() {
	console.log("\n📧 Testing simple email sending...");

	const emailData = {
		email: {
			from: "test@example.com",
			to: ["recipient@example.com"],
			subject: "Test Email from Selfmail Relay",
			text: "This is a test email sent via the Selfmail Relay server!",
			html: "<h1>Test Email</h1><p>This is a test email sent via the <strong>Selfmail Relay</strong> server!</p>",
		},
	};

	try {
		const response = await fetch(`${RELAY_URL}/send`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(emailData),
		});

		const result = await response.json();
		console.log("📤 Simple email result:", result);
	} catch (error) {
		console.error("❌ Simple email error:", error);
	}
}

// Test 2: Send email with custom SMTP configuration
async function testCustomSMTP() {
	console.log("\n🔧 Testing email with custom SMTP...");

	const emailData = {
		email: {
			from: "sender@example.com",
			to: ["recipient@example.com"],
			cc: ["cc@example.com"],
			subject: "Test Email with Custom SMTP",
			text: "This email was sent using a custom SMTP configuration.",
			html: "<h2>Custom SMTP Test</h2><p>This email was sent using a <em>custom SMTP configuration</em>.</p>",
		},
		smtp: {
			host: "smtp.example.com",
			port: 587,
			secure: false,
			auth: {
				user: "your-email@example.com",
				pass: "your-password",
			},
			tls: {
				rejectUnauthorized: false,
			},
		},
	};

	try {
		const response = await fetch(`${RELAY_URL}/send`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(emailData),
		});

		const result = await response.json();
		console.log("📧 Custom SMTP result:", result);
	} catch (error) {
		console.error("❌ Custom SMTP error:", error);
	}
}

// Test 3: Verify SMTP configuration
async function testSMTPVerification() {
	console.log("\n🔍 Testing SMTP verification...");

	const smtpConfig = {
		host: "smtp.gmail.com",
		port: 587,
		secure: false,
		auth: {
			user: "test@gmail.com",
			pass: "fake-password",
		},
	};

	try {
		const response = await fetch(`${RELAY_URL}/send/verify`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(smtpConfig),
		});

		const result = await response.json();
		console.log("✅ SMTP verification result:", result);
	} catch (error) {
		console.error("❌ SMTP verification error:", error);
	}
}

// Test 4: Get email sender statistics
async function testEmailStats() {
	console.log("\n📊 Testing email sender statistics...");

	try {
		const response = await fetch(`${RELAY_URL}/send/stats`);
		const result = await response.json();
		console.log("📈 Email stats:", result);
	} catch (error) {
		console.error("❌ Email stats error:", error);
	}
}

// Test 5: Email with attachments
async function testEmailWithAttachments() {
	console.log("\n📎 Testing email with attachments...");

	// Create a simple text file attachment (base64 encoded)
	const textContent = "Hello, this is a test attachment!";
	const base64Content = Buffer.from(textContent).toString("base64");

	const emailData = {
		email: {
			from: "sender@example.com",
			to: ["recipient@example.com"],
			subject: "Test Email with Attachment",
			text: "This email contains an attachment.",
			html: "<h3>Email with Attachment</h3><p>This email contains an attachment. Check it out!</p>",
			attachments: [
				{
					filename: "test.txt",
					content: base64Content,
					contentType: "text/plain",
				},
				{
					filename: "inline-image.txt",
					content: base64Content,
					contentType: "text/plain",
					cid: "inline-attachment-1",
				},
			],
		},
	};

	try {
		const response = await fetch(`${RELAY_URL}/send`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(emailData),
		});

		const result = await response.json();
		console.log("📎 Attachment email result:", result);
	} catch (error) {
		console.error("❌ Attachment email error:", error);
	}
}

// Run all tests
async function runAllTests() {
	console.log("🚀 Starting Selfmail Relay Email Tests");
	console.log("=====================================");

	// Check if server is running
	try {
		const healthResponse = await fetch(`${RELAY_URL}/health`);
		const health = await healthResponse.json();
		console.log("✅ Server health:", health);
	} catch (error) {
		console.error("❌ Server not running! Start it with: bun run src/index.ts");
		return;
	}

	await testSimpleEmail();
	await testCustomSMTP();
	await testSMTPVerification();
	await testEmailStats();
	await testEmailWithAttachments();

	console.log("\n🏁 All tests completed!");
	console.log("\n💡 Tips:");
	console.log(
		"• Set GMAIL_USER and GMAIL_PASS environment variables to test with Gmail",
	);
	console.log(
		"• Set OUTLOOK_USER and OUTLOOK_PASS environment variables to test with Outlook",
	);
	console.log(
		"• Use the /send/verify endpoint to test SMTP configurations before sending",
	);
	console.log("• Check the API documentation at http://localhost:8080/docs");
}

// Run the tests
runAllTests().catch(console.error);
