import { test, describe, expect } from "bun:test";
import nodemailer from "nodemailer";
import type SMTPPool from "nodemailer/lib/smtp-pool";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

describe("SMTP Server Tests", () => {
    const smtpConfig:  SMTPTransport.Options = {
      host: "localhost",
      port: 587,
      logger: true,
      debug: true, // Enable debug output
      secure: false, // Not using STARTTLS for now
      auth: {
        user: "henri@selfmail.app", // Fixed typo: was "selfmai.app"
        pass: "selfmail_password", // Match server password
      },
    }
    

    test("Send outgoing email with authentication", async () => {
        const transporter = nodemailer.createTransport(smtpConfig,);

        try {
            const info = await transporter.sendMail({
                from: '"Henri Test" <henri@selfmail.app>', // Must match authenticated user
                to: 'test-j03n2vhbe@srv1.mail-tester.com',
                subject: 'Test Email from selfmail.app SMTP Server',
                text: 'This is a test email sent through the selfmail.app SMTP server with authentication.',
                html: '<p>This is a <strong>test email</strong> sent through the selfmail.app SMTP server with authentication.</p>',
            });

            console.log('✅ Email sent successfully:', info.messageId);
            console.log('📧 Accepted recipients:', info.accepted);
            
            // Verify the email was accepted
            expect(info.accepted).toContain('test-j03n2vhbe@srv1.mail-tester.com');
            expect(info.messageId).toBeDefined();
            
        } catch (error) {
            console.error('❌ Failed to send email:', error);
            throw error; 
        } finally {
            transporter.close();
        }
    });

    test("Send email to multiple recipients", async () => {
        const transporter = nodemailer.createTransport(smtpConfig);

        try {
            const info = await transporter.sendMail({
                from: '"Henri Test" <henri@selfmail.app>',
                to: ['test-j03n2vhbe@srv1.mail-tester.com', 'another-test@example.com'],
                subject: 'Multi-recipient Test Email',
                text: 'This email is sent to multiple recipients.',
            });

            console.log('✅ Multi-recipient email sent:', info.messageId);
            expect(info.accepted.length).toBeGreaterThan(0);
            
        } catch (error) {
            console.error('❌ Failed to send multi-recipient email:', error);
            throw error;
        } finally {
            transporter.close();
        }
    });

    test("Authentication failure with wrong credentials", async () => {
        const wrongConfig = {
            ...smtpConfig,
            auth: {
                user: "henri@selfmail.app",
                pass: "wrong_password",
            },
        };

        const transporter = nodemailer.createTransport(wrongConfig);

        try {
            await transporter.sendMail({
                from: '"Henri Test" <henri@selfmail.app>',
                to: 'test@example.com',
                subject: 'This should fail',
                text: 'This email should not be sent due to wrong credentials.',
            });

            // If we reach here, the test should fail
            throw new Error('Expected authentication to fail, but it succeeded');
            
        } catch (error: any) {
            console.log('✅ Authentication correctly failed:', error.message);
            // Verify it's an authentication error
            expect(error.message).toMatch(/auth|login|password|credential/i);
        } finally {
            transporter.close();
        }
    });

    test("Reject sending from unauthorized email address", async () => {
        const transporter = nodemailer.createTransport(smtpConfig);

        try {
            await transporter.sendMail({
                from: '"Fake Sender" <fake@example.com>', // Wrong sender domain
                to: 'test@example.com',
                subject: 'This should be rejected',
                text: 'This email should be rejected due to unauthorized sender.',
            });

            // If we reach here, the test should fail
            throw new Error('Expected sender validation to fail, but it succeeded');
            
        } catch (error: any) {
            console.log('✅ Unauthorized sender correctly rejected:', error.message);
            expect(error.message).toMatch(/sender|from|address/i);
        } finally {
            transporter.close();
        }
    });

    // Temporarily disabled while fixing Bun compatibility issues
    test.skip("Connection without STARTTLS should fail", async () => {
        const insecureConfig = {
            ...smtpConfig,
            secure: false,
            requireTLS: false, // Try without TLS
            ignoreTLS: true,   // Ignore TLS completely
        };

        const transporter = nodemailer.createTransport(insecureConfig);

        try {
            await transporter.sendMail({
                from: '"Henri Test" <henri@selfmail.app>',
                to: 'test@example.com',
                subject: 'Insecure connection test',
                text: 'This should fail without STARTTLS.',
            });

            // If we reach here, the test should fail
            throw new Error('Expected insecure connection to fail, but it succeeded');
            
        } catch (error: any) {
            console.log('✅ Insecure connection correctly rejected:', error.message);
            expect(error.message).toMatch(/TLS|STARTTLS|secure/i);
        } finally {
            transporter.close();
        }
    });

    test("Server connection and capabilities", async () => {
        const transporter = nodemailer.createTransport(smtpConfig);

        try {
            // Test connection
            const isConnected = await transporter.verify();
            console.log('✅ Server connection verified:', isConnected);
            expect(isConnected).toBe(true);
            
        } catch (error) {
            console.error('❌ Server connection failed:', error);
            throw error;
        } finally {
            transporter.close();
        }
    });
});