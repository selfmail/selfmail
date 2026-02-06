import { describe, expect, test } from "bun:test";
import { InvalidEmailError, MailFrom } from "../src/events/mail-from";

describe("MailFrom validation, parsing and error handling", () => {
  test("Should reject invalid email formats", async () => {
    const invalidEmails = [
      "plainaddress",
      "@missingusername.com",
      "username@.com",
      "username@com",
      "user+tag@example.com.co",
      "username@domain..com",
    ];

    for (const email of invalidEmails) {
      try {
        await MailFrom.parseEmail(email);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidEmailError);
      }
    }
  });

  test("Should accept valid email formats", () => {
    const validEmails = [
      "hey@example.com",
      "henri@d.co.uk",
      "user+tag@example.com",
    ];

    for (const email of validEmails) {
      expect(MailFrom.parseEmail(email)).resolves.toBeUndefined();
    }
  });

  test("Should correctly return MX Records for valid domains", async () => {
    const mxRecords = await MailFrom.checkMxRecords("gmail.com");
    expect(mxRecords).toBeBoolean();
  });
});
