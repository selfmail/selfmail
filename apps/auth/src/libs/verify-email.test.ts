import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	deleteCookie: vi.fn(),
	deleteMany: vi.fn(),
	findUnique: vi.fn(),
	getCookie: vi.fn(),
	sessionCreate: vi.fn(),
	setCookie: vi.fn(),
	transaction: vi.fn(),
	userUpdate: vi.fn(),
}));

vi.mock("@selfmail/db", () => ({
	db: {
		$transaction: mocks.transaction,
		emailVerification: {
			deleteMany: mocks.deleteMany,
			findUnique: mocks.findUnique,
		},
	},
}));

vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => {
		const builder = {
			handler: (
				handler: (input: {
					data: { redirect?: string; token: string };
				}) => unknown,
			) => handler,
			validator: () => builder,
		};

		return builder;
	},
}));

vi.mock("@tanstack/react-start/server", () => ({
	deleteCookie: mocks.deleteCookie,
	getCookie: mocks.getCookie,
	getRequestHost: () => "auth.selfmail.localhost",
	getRequestProtocol: () => "https",
	setCookie: mocks.setCookie,
}));

vi.mock("#/paraglide/messages", () => ({
	m: {
		"verify.errors.expired": () => "expired",
		"verify.errors.invalid": () => "invalid",
		"verify.errors.unknown": () => "unknown",
		"verify.success.description": () => "verified",
	},
}));

vi.mock("#/utils/redirect.server", () => ({
	getSafeInternalRedirectUrl: (_path: string | undefined, fallback: string) =>
		fallback,
}));

import { verifyEmailTokenFn } from "./verify-email";

const browserToken = "browser-token";
const verification = {
	browserTokenHash: crypto
		.createHash("sha256")
		.update(browserToken)
		.digest("hex"),
	expiresAt: new Date(Date.now() + 60_000),
	id: "verification-id",
	user: { emailVerified: null },
	userId: "user-id",
};

describe("email verification", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "log").mockImplementation(() => undefined);
		mocks.findUnique.mockResolvedValue(verification);
		mocks.getCookie.mockReturnValue(browserToken);
		mocks.deleteMany.mockResolvedValue({ count: 1 });
		mocks.sessionCreate.mockResolvedValue({});
		mocks.userUpdate.mockResolvedValue({});
		mocks.transaction.mockImplementation(
			async (
				callback: (tx: {
					emailVerification: { deleteMany: typeof mocks.deleteMany };
					session: { create: typeof mocks.sessionCreate };
					user: { update: typeof mocks.userUpdate };
				}) => Promise<unknown>,
			) =>
				callback({
					emailVerification: { deleteMany: mocks.deleteMany },
					session: { create: mocks.sessionCreate },
					user: { update: mocks.userUpdate },
				}),
		);
	});

	it("creates the session in the same transaction that consumes the token", async () => {
		const response = await verifyEmailTokenFn({
			data: { token: "verification-token" },
		}).catch((error: unknown) => {
			if (error instanceof Response) {
				return error;
			}

			throw error;
		});

		expect(response).toBeInstanceOf(Response);
		if (!(response instanceof Response)) {
			throw new Error("Expected a redirect response");
		}
		expect(response.status).toBe(302);
		expect(response.headers.get("Location")).toBe(
			"https://dashboard.selfmail.localhost",
		);
		expect(mocks.transaction).toHaveBeenCalledOnce();
		expect(mocks.deleteMany).toHaveBeenCalledWith({
			where: { id: verification.id },
		});
		expect(mocks.sessionCreate).toHaveBeenCalledWith({
			data: expect.objectContaining({ userId: verification.userId }),
		});
		expect(mocks.setCookie).toHaveBeenCalledOnce();
	});

	it("does not consume the token outside the transaction when session creation fails", async () => {
		mocks.sessionCreate.mockRejectedValueOnce(
			new Error("database unavailable"),
		);

		await expect(
			verifyEmailTokenFn({ data: { token: "verification-token" } }),
		).resolves.toMatchObject({
			status: "error",
			error: { message: "unknown" },
		});

		expect(mocks.sessionCreate).toHaveBeenCalledOnce();
		expect(mocks.setCookie).not.toHaveBeenCalled();
	});

	it("verifies the email without creating a session in a different browser", async () => {
		mocks.getCookie.mockReturnValue(undefined);

		await expect(
			verifyEmailTokenFn({ data: { token: "verification-token" } }),
		).resolves.toEqual({
			status: "login_required",
			message: "verified",
		});

		expect(mocks.sessionCreate).not.toHaveBeenCalled();
		expect(mocks.setCookie).not.toHaveBeenCalled();
	});

	it("rejects a token already consumed by another request", async () => {
		mocks.deleteMany.mockResolvedValueOnce({ count: 0 });

		await expect(
			verifyEmailTokenFn({ data: { token: "verification-token" } }),
		).resolves.toMatchObject({
			status: "error",
			error: { message: "invalid" },
		});

		expect(mocks.userUpdate).not.toHaveBeenCalled();
		expect(mocks.sessionCreate).not.toHaveBeenCalled();
	});
});
