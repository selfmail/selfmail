import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { blocked } from "../src/handler/mail-from/blocked";

// TODO: add test database and test smtp server
beforeAll(() => {
	// Set up test database
});

afterAll(() => {
	// Clean up
});

describe("Helper Functions", () => {
	test("not blocked email", async () => {
		const result = await blocked("not-blocked@example.com");
		expect(result).toBe(false);
	});
});
