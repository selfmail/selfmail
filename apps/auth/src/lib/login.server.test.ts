import { beforeEach, describe, expect, it, vi } from "vitest";

const logger = {
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
};

const db = {
  $transaction: vi.fn(async <T>(operations: Promise<T>[]) => Promise.all(operations)),
  magicLink: {
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
};

const enforceAuthRateLimit = vi.fn();
const createBrowserToken = vi.fn(() => "browser-token");
const hashToken = vi.fn(async (value: string) => `hash:${value}`);
const setTempSessionCookie = vi.fn();

vi.mock("@selfmail/db", () => ({
  db,
}));

vi.mock("@selfmail/logging", () => ({
  createLogger: vi.fn(() => logger),
}));

vi.mock("#/utils/ratelimit.server", () => ({
  AuthRatelimitUtils: {
    enforce: enforceAuthRateLimit,
  },
}));

vi.mock("#/utils/session.server", () => ({
  SessionUtils: {
    createBrowserToken,
    hashToken,
    setTempSessionCookie,
  },
}));

describe("login.server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.user.findUnique.mockResolvedValue({
      id: "user-1",
    });
    db.magicLink.deleteMany.mockResolvedValue({
      count: 1,
    });
    db.magicLink.create.mockResolvedValue({
      id: "magic-link-1",
    });
    enforceAuthRateLimit.mockResolvedValue({
      allowed: true,
      resetAt: new Date("2026-03-29T12:00:00.000Z"),
    });
  });

  it("stores only hashed magic link and browser tokens", async () => {
    const { handleLogin } = await import("#/lib/login.server");
    const result = await handleLogin({
      email: "alice@example.com",
    });
    const magicLinkData = db.magicLink.create.mock.calls[0]?.[0]?.data;
    const rawMagicLinkToken = hashToken.mock.calls[0]?.[0];

    expect(result).toEqual({
      status: "success",
    });
    expect(magicLinkData.browserTokenHash).toBe("hash:browser-token");
    expect(magicLinkData.token).toBe(`hash:${rawMagicLinkToken}`);
    expect(magicLinkData.token).not.toBe(rawMagicLinkToken);
    expect(setTempSessionCookie).toHaveBeenCalledWith("browser-token");
  });

  it("returns account-not-found when no user exists for the email", async () => {
    const { handleLogin } = await import("#/lib/login.server");

    db.user.findUnique.mockResolvedValue(null);

    const result = await handleLogin({
      email: "alice@example.com",
    });

    expect(result.status).toBe("error");
    expect(db.magicLink.create).not.toHaveBeenCalled();
    if (result.status === "error") {
      expect(result.error.code).toBe("ACCOUNT_NOT_FOUND");
    }
  });

  it("fails closed when the login rate limit is hit", async () => {
    const { handleLogin } = await import("#/lib/login.server");

    enforceAuthRateLimit.mockResolvedValue({
      allowed: false,
      resetAt: new Date("2026-03-29T12:00:00.000Z"),
    });

    const result = await handleLogin({
      email: "alice@example.com",
    });

    expect(result.status).toBe("error");
    expect(db.magicLink.create).not.toHaveBeenCalled();
    if (result.status === "error") {
      expect(result.error.code).toBe("RATE_LIMITED");
    }
  });
});
