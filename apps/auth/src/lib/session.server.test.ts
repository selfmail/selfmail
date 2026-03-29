import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = new Map<string, string>();
const requestState = {
  host: "auth.selfmail.local:3010",
  protocol: "http",
};

const db = {
  session: {
    create: vi.fn(),
    deleteMany: vi.fn(),
    findUnique: vi.fn(),
  },
};

const deleteCookie = vi.fn((name: string) => {
  cookieStore.delete(name);
});

const getCookie = vi.fn((name: string) => cookieStore.get(name));
const getRequestHost = vi.fn(() => requestState.host);
const getRequestProtocol = vi.fn(() => requestState.protocol);
const setCookie = vi.fn((name: string, value: string) => {
  cookieStore.set(name, value);
});

vi.mock("@selfmail/db", () => ({
  db,
}));

vi.mock("@tanstack/react-start/server", () => ({
  deleteCookie,
  getCookie,
  getRequestHost,
  getRequestProtocol,
  setCookie,
}));

describe("session.server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieStore.clear();
    requestState.host = "auth.selfmail.local:3010";
    requestState.protocol = "http";
    delete process.env.SELFMAIL_APP_URL;
  });

  it("hashes session tokens before writing them to the database", async () => {
    const { createSession, hashToken, SESSION_COOKIE_NAME } = await import(
      "#/lib/session.server"
    );

    await createSession("user-1");

    const rawToken = setCookie.mock.calls[0]?.[1];
    const storedToken = db.session.create.mock.calls[0]?.[0]?.data.sessionToken;

    expect(setCookie).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      rawToken,
      expect.objectContaining({
        domain: ".selfmail.local",
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      }),
    );
    expect(storedToken).toBe(await hashToken(rawToken));
    expect(storedToken).not.toBe(rawToken);
  });

  it("clears the cookie when the stored session no longer exists", async () => {
    const { getCurrentUser, hashToken, SESSION_COOKIE_NAME } = await import(
      "#/lib/session.server"
    );
    const rawToken = "raw-session-token";

    cookieStore.set(SESSION_COOKIE_NAME, rawToken);
    db.session.findUnique.mockResolvedValue(null);

    const user = await getCurrentUser();

    expect(user).toBeNull();
    expect(db.session.findUnique).toHaveBeenCalledWith({
      include: {
        user: true,
      },
      where: {
        sessionToken: await hashToken(rawToken),
      },
    });
    expect(deleteCookie).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      expect.objectContaining({
        domain: ".selfmail.local",
      }),
    );
  });

  it("deletes expired sessions and clears the cookie", async () => {
    const { getCurrentUser, hashToken, SESSION_COOKIE_NAME } = await import(
      "#/lib/session.server"
    );
    const rawToken = "expired-session-token";

    cookieStore.set(SESSION_COOKIE_NAME, rawToken);
    db.session.findUnique.mockResolvedValue({
      expires: new Date(Date.now() - 1_000),
      user: {
        id: "user-1",
      },
    });

    const user = await getCurrentUser();

    expect(user).toBeNull();
    expect(db.session.deleteMany).toHaveBeenCalledWith({
      where: {
        sessionToken: await hashToken(rawToken),
      },
    });
    expect(deleteCookie).toHaveBeenCalledOnce();
  });

  it("returns the configured app url when present", async () => {
    const { getAppRedirectUrl } = await import("#/lib/session.server");

    process.env.SELFMAIL_APP_URL = "https://dashboard.example.com";

    expect(getAppRedirectUrl()).toBe("https://dashboard.example.com");
  });

  it("falls back to shared dev and prod app urls based on the request host", async () => {
    const { getAppRedirectUrl } = await import("#/lib/session.server");

    requestState.host = "workspace.selfmail.local:3010";
    expect(getAppRedirectUrl()).toBe("http://selfmail.local");

    requestState.host = "auth.selfmail.app";
    requestState.protocol = "https";
    expect(getAppRedirectUrl()).toBe("https://selfmail.app");
  });
});
