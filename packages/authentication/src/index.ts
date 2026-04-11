export interface AuthenticationUser {
  id: string;
}

export interface AuthenticationCookieOptions {
  domain?: string;
  httpOnly: boolean;
  maxAge: number;
  path: string;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
}

export interface AuthenticationCookieStore {
  delete: (name: string, options: AuthenticationCookieOptions) => void;
  get: (name: string) => string | undefined;
  set: (
    name: string,
    value: string,
    options: AuthenticationCookieOptions
  ) => void;
}

export interface AuthenticationRequest {
  appUrl?: string;
  host: string;
  protocol: string;
}

export interface AuthenticationSessionRecord<TUser extends AuthenticationUser> {
  expires: Date;
  user: TUser;
}
const protocolRegex = /:$/;
export interface AuthenticationSessionRepository<
  TUser extends AuthenticationUser,
> {
  createSession: (input: {
    expires: Date;
    sessionTokenHash: string;
    userId: string;
  }) => Promise<void>;
  deleteSession: (sessionTokenHash: string) => Promise<void>;
  findSession: (
    sessionTokenHash: string
  ) => Promise<AuthenticationSessionRecord<TUser> | null>;
}

export interface AuthenticationLogger {
  info?: (message: string, context: Record<string, unknown>) => void;
  warn?: (message: string, context: Record<string, unknown>) => void;
}

interface AuthenticationDependencies<TUser extends AuthenticationUser> {
  logger?: AuthenticationLogger;
  sessions: AuthenticationSessionRepository<TUser>;
}

interface CookieContext {
  cookies: AuthenticationCookieStore;
  request: AuthenticationRequest;
}

const PROD_SHARED_DOMAIN = "selfmail.app";
const DEV_SHARED_DOMAIN = "selfmail.local";
const DEV_LOCALHOST_DOMAIN = "selfmail.localhost";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
const TEMP_SESSION_DURATION_SECONDS = 60 * 15;

export class Authentication<TUser extends AuthenticationUser> {
  static readonly SESSION_COOKIE_NAME = "selfmail-session-token";
  static readonly TEMP_SESSION_COOKIE_NAME = "selfmail-temp-session-token";

  private readonly logger: AuthenticationLogger;
  private readonly sessions: AuthenticationSessionRepository<TUser>;

  constructor({ logger, sessions }: AuthenticationDependencies<TUser>) {
    this.logger = logger ?? {};
    this.sessions = sessions;
  }

  private normalizeHost(host: string) {
    return host.split(":")[0]?.trim().toLowerCase() ?? "";
  }
  private normalizeProtocol(protocol: string) {
    return protocol.replace(protocolRegex, "").trim().toLowerCase();
  }

  private matchesSharedDomain(hostname: string, domain: string) {
    return hostname === domain || hostname.endsWith(`.${domain}`);
  }

  private getCookieConfig(
    request: AuthenticationRequest,
    maxAge: number
  ): AuthenticationCookieOptions {
    const hostname = this.normalizeHost(request.host);
    const protocol = this.normalizeProtocol(request.protocol);

    return {
      domain: this.getCookieDomain(request.host),
      httpOnly: true,
      maxAge,
      path: "/",
      sameSite: "lax",
      secure:
        protocol === "https" ||
        this.matchesSharedDomain(hostname, PROD_SHARED_DOMAIN),
    };
  }

  createBrowserToken() {
    return crypto.randomUUID().replaceAll("-", "");
  }

  getCookieDomain(host: string) {
    const hostname = this.normalizeHost(host);

    if (this.matchesSharedDomain(hostname, PROD_SHARED_DOMAIN)) {
      return `.${PROD_SHARED_DOMAIN}`;
    }

    if (this.matchesSharedDomain(hostname, DEV_LOCALHOST_DOMAIN)) {
      return `.${DEV_LOCALHOST_DOMAIN}`;
    }

    if (this.matchesSharedDomain(hostname, DEV_SHARED_DOMAIN)) {
      return `.${DEV_SHARED_DOMAIN}`;
    }

    return undefined;
  }

  getAppRedirectUrl({ request }: Pick<CookieContext, "request">) {
    if (request.appUrl?.trim()) {
      return request.appUrl.trim();
    }

    const host = this.normalizeHost(request.host);

    if (this.matchesSharedDomain(host, DEV_LOCALHOST_DOMAIN)) {
      return `http://${DEV_LOCALHOST_DOMAIN}`;
    }

    if (this.matchesSharedDomain(host, DEV_SHARED_DOMAIN)) {
      return `http://${DEV_SHARED_DOMAIN}`;
    }

    return `https://${PROD_SHARED_DOMAIN}`;
  }

  getTempSessionCookie({ cookies }: Pick<CookieContext, "cookies">) {
    return cookies.get(Authentication.TEMP_SESSION_COOKIE_NAME);
  }

  async hashToken(value: string) {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value)
    );

    return Array.from(new Uint8Array(digest), (part) =>
      part.toString(16).padStart(2, "0")
    ).join("");
  }

  async createSession({
    cookies,
    request,
    userId,
  }: CookieContext & { userId: string }) {
    const rawToken = this.createBrowserToken();
    const sessionTokenHash = await this.hashToken(rawToken);
    const expires = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
    const cookieDomain = this.getCookieDomain(request.host);

    await this.sessions.createSession({
      expires,
      sessionTokenHash,
      userId,
    });

    cookies.set(
      Authentication.SESSION_COOKIE_NAME,
      rawToken,
      this.getCookieConfig(request, SESSION_DURATION_SECONDS)
    );

    this.logger.info?.("Created auth session", {
      cookieDomain,
      expiresAt: expires.toISOString(),
      host: request.host,
      userId,
    });

    return {
      expires,
      sessionToken: rawToken,
    };
  }

  clearSessionCookie({ cookies, request }: CookieContext) {
    cookies.delete(
      Authentication.SESSION_COOKIE_NAME,
      this.getCookieConfig(request, 0)
    );
  }

  setTempSessionCookie({
    cookies,
    request,
    token,
  }: CookieContext & {
    token: string;
  }) {
    cookies.set(
      Authentication.TEMP_SESSION_COOKIE_NAME,
      token,
      this.getCookieConfig(request, TEMP_SESSION_DURATION_SECONDS)
    );
  }

  clearTempSessionCookie({ cookies, request }: CookieContext) {
    cookies.delete(
      Authentication.TEMP_SESSION_COOKIE_NAME,
      this.getCookieConfig(request, 0)
    );
  }

  async getCurrentUser({ cookies, request }: CookieContext) {
    const cookieDomain = this.getCookieDomain(request.host);
    const rawToken = cookies.get(Authentication.SESSION_COOKIE_NAME);

    this.logger.info?.("Resolving auth session", {
      cookieDomain,
      hasSessionCookie: Boolean(rawToken),
      host: request.host,
    });

    if (!rawToken) {
      return null;
    }

    const sessionTokenHash = await this.hashToken(rawToken);
    const session = await this.sessions.findSession(sessionTokenHash);

    if (!session) {
      this.logger.warn?.("Auth session cookie did not match a stored session", {
        cookieDomain,
        host: request.host,
        sessionTokenHashPrefix: sessionTokenHash.slice(0, 12),
      });
      this.clearSessionCookie({ cookies, request });
      return null;
    }

    if (session.expires < new Date()) {
      this.logger.info?.("Auth session expired", {
        cookieDomain,
        host: request.host,
        sessionTokenHashPrefix: sessionTokenHash.slice(0, 12),
        userId: session.user.id,
      });
      await this.sessions.deleteSession(sessionTokenHash);
      this.clearSessionCookie({ cookies, request });
      return null;
    }

    this.logger.info?.("Resolved auth session", {
      cookieDomain,
      host: request.host,
      userId: session.user.id,
    });

    return session.user;
  }

  async destroySession({ cookies, request }: CookieContext) {
    const rawToken = cookies.get(Authentication.SESSION_COOKIE_NAME);

    if (rawToken) {
      await this.sessions.deleteSession(await this.hashToken(rawToken));
    }

    this.clearSessionCookie({ cookies, request });
  }
}
