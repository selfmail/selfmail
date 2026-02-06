import { describe, expect, test } from "bun:test";
import { InvalidEmailError, MailFrom } from "../src/events/mail-from";

describe("MailFrom validation, parsing and error handling", () => {
  test("Should reject invalid email formats", async () => {
    const invalidEmails = [
      "plainaddress",
      "@missingusername.com",
      "username@.com",
      "username@com",
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
});
