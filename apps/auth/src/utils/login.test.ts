import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	accountFindUnique: vi.fn(),
	magicLinkCreate: vi.fn(),
	magicLinkDeleteMany: vi.fn(),
	setCookie: vi.fn(),
	transaction: vi.fn(),
}));

vi.mock("@selfmail/db", () => ({
	db: {
		$transaction: mocks.transaction,
		account: { findUnique: mocks.accountFindUnique },
		magicLink: {
			create: mocks.magicLinkCreate,
			deleteMany: mocks.magicLinkDeleteMany,
		},
	},
}));

vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => {
		const builder = {
			handler: (handler: (input: { data: { email: string } }) => unknown) =>
				handler,
			validator: () => builder,
		};

		return builder;
	},
}));

vi.mock("@tanstack/react-start/server", () => ({
	setCookie: mocks.setCookie,
}));

import { handleLoginForm } from "./login";

describe("login magic link", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mocks.accountFindUnique.mockResolvedValue({ userId: "user-id" });
		mocks.magicLinkCreate.mockReturnValue({ operation: "create" });
		mocks.magicLinkDeleteMany.mockReturnValue({ operation: "deleteMany" });
		mocks.transaction.mockResolvedValue([]);
	});

	it("logs the magic-link verifier URL and stores the normalized email", async () => {
		vi.stubEnv("NODE_ENV", "development");
		const consoleLog = vi
			.spyOn(console, "log")
			.mockImplementation(() => undefined);

		await handleLoginForm({ data: { email: "User@Example.com" } });

		expect(mocks.accountFindUnique).toHaveBeenCalledWith({
			where: {
				provider_providerAccountId: {
					provider: "EMAIL",
					providerAccountId: "user@example.com",
				},
			},
		});
		expect(mocks.magicLinkDeleteMany).toHaveBeenCalledWith({
			where: { email: "user@example.com" },
		});
		expect(mocks.magicLinkCreate).toHaveBeenCalledWith({
			data: expect.objectContaining({ email: "user@example.com" }),
		});
		expect(consoleLog).toHaveBeenCalledWith(
			expect.stringContaining("https://auth.selfmail.localhost/magic/?token="),
		);
		expect(consoleLog).not.toHaveBeenCalledWith(
			expect.stringContaining("/verify?token="),
		);
	});
});
