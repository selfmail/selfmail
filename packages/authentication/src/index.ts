import { db, type User } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { RateLimiter } from "@selfmail/web-ratelimit";

interface AuthenticationCookieOptions {
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

interface AuthenticationRequest {
  host: string;
  protocol: string;
}

interface TokenInput {
  token?: string;
}

interface CookieInput {
  cookies: AuthenticationCookieStore;
  request: AuthenticationRequest;
}

const PROD_SHARED_DOMAIN = "selfmail.app";
const DEV_SHARED_DOMAIN = "selfmail.local";
const DEV_LOCALHOST_DOMAIN = "selfmail.localhost";
const protocolRegex = /:$/;

export class Authentication {
  private readonly logger: ReturnType<typeof createLogger>;
  COOKIE_NAME = "selfmail-session-token";
  private readonly limiter: RateLimiter;

  constructor({ identifier }: { identifier?: string } = {}) {
    this.logger = createLogger(
      identifier ? `authentication-${identifier}` : "authentication"
    );
    this.limiter = new RateLimiter(identifier || "global");
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

  private getCookieDomain(host: string) {
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

  private async hashToken(value: string) {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value)
    );

    return Array.from(new Uint8Array(digest), (part) =>
      part.toString(16).padStart(2, "0")
    ).join("");
  }

  private clearSessionCookie({ cookies, request }: CookieInput) {
    cookies.delete(this.COOKIE_NAME, this.getCookieConfig(request, 0));
  }

  async getCurrentUser(input: TokenInput | CookieInput): Promise<User | null> {
    const token =
      "cookies" in input ? input.cookies.get(this.COOKIE_NAME) : input.token;

    if (!token) {
      this.logger.warn("No session token provided");
      return null;
    }

    const sessionTokenHash = await this.hashToken(token);
    const result = await this.limiter.limit(sessionTokenHash, {
      limit: 50,
      windowSeconds: 60,
    });

    if (!result.allowed) {
      this.logger.warn("Rate limit exceeded for session token", {
        sessionTokenHashPrefix: sessionTokenHash.slice(0, 12),
      });
      throw new Error("Too many requests. Please try again later.");
    }

    const session = await db.session.findUnique({
      where: {
        sessionToken: sessionTokenHash,
      },
      include: { user: true },
    });

    if (!session) {
      this.logger.warn("Invalid session token", {
        sessionTokenHashPrefix: sessionTokenHash.slice(0, 12),
      });
      return null;
    }

    if (session.expires < new Date()) {
      await db.session.deleteMany({
        where: {
          sessionToken: sessionTokenHash,
        },
      });

      if ("cookies" in input) {
        this.clearSessionCookie(input);
      }

      return null;
    }

    return session.user;
  }
}
