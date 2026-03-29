import { beforeEach, describe, expect, it, vi } from "vitest";

const logger = {
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
};

const tx = {
  emailVerification: {
    create: vi.fn(),
  },
  user: {
    create: vi.fn(),
  },
};

const db = {
  $transaction: vi.fn(
    async (callback: (transaction: typeof tx) => Promise<unknown>) =>
      callback(tx),
  ),
};

const enforceAuthRateLimit = vi.fn();
const createBrowserToken = vi.fn(() => "browser-token");
const getTempSessionCookie = vi.fn();
const hashToken = vi.fn(async (value: string) => `hash:${value}`);
const setTempSessionCookie = vi.fn();

vi.mock("@selfmail/db", () => ({
  db,
}));

vi.mock("@selfmail/logging", () => ({
  createLogger: vi.fn(() => logger),
}));

vi.mock("#/lib/ratelimit", () => ({
  enforceAuthRateLimit,
}));

vi.mock("#/lib/session.server", () => ({
  createBrowserToken,
  getTempSessionCookie,
  hashToken,
  setTempSessionCookie,
}));

describe("register.server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tx.user.create.mockResolvedValue({
      id: "user-1",
    });
    tx.emailVerification.create.mockResolvedValue({
      id: "verification-1",
    });
    enforceAuthRateLimit.mockResolvedValue({
      allowed: true,
      resetAt: new Date("2026-03-29T12:00:00.000Z"),
    });
  });

  it("stores only hashed verification and browser tokens", async () => {
    const { handleRegister } = await import("#/lib/register.server");
    const result = await handleRegister({
      email: "alice@example.com",
      name: "Alice",
    });
    const verificationData =
      tx.emailVerification.create.mock.calls[0]?.[0]?.data;
    const rawVerificationToken = hashToken.mock.calls[1]?.[0];

    expect(result).toEqual({
      email: "alice@example.com",
      status: "success",
    });
    expect(verificationData.browserTokenHash).toBe("hash:browser-token");
    expect(verificationData.token).toBe(`hash:${rawVerificationToken}`);
    expect(verificationData.token).not.toBe(rawVerificationToken);
    expect(setTempSessionCookie).toHaveBeenCalledWith("browser-token");
  });

  it("returns a stable validation error when the email is already taken", async () => {
    const { handleRegister } = await import("#/lib/register.server");

    tx.user.create.mockRejectedValue(
      Object.assign(new Error("Unique constraint failed"), {
        code: "P2002",
      }),
    );

    const result = await handleRegister({
      email: "alice@example.com",
      name: "Alice",
    });

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.error.code).toBe("EMAIL_TAKEN");
    }
  });

  it("fails closed when the register rate limit is hit", async () => {
    const { handleRegister } = await import("#/lib/register.server");

    enforceAuthRateLimit.mockResolvedValue({
      allowed: false,
      resetAt: new Date("2026-03-29T12:00:00.000Z"),
    });

    const result = await handleRegister({
      email: "alice@example.com",
      name: "Alice",
    });

    expect(result.status).toBe("error");
    expect(db.$transaction).not.toHaveBeenCalled();
    if (result.status === "error") {
      expect(result.error.code).toBe("RATE_LIMITED");
    }
  });
});
