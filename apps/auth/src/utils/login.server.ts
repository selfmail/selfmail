import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { RateLimiter } from "@selfmail/web-ratelimit";
import {
  getRequestHost,
  getRequestProtocol,
  setCookie,
} from "@tanstack/react-start/server";

const limiter = new RateLimiter("auth-login");
const logger = createLogger("auth-login");
const TEMP_SESSION_COOKIE_NAME = "selfmail-temp-session-token";
const PROD_SHARED_DOMAIN = "selfmail.app";
const DEV_SHARED_DOMAIN = "selfmail.local";
const DEV_LOCALHOST_DOMAIN = "selfmail.localhost";

export type LoginResult =
  | {
      status: "error";
      error: {
        code: "RATE_LIMITED" | "ACCOUNT_NOT_FOUND" | "UNKNOWN_ERROR";
        message: string;
        requestId: string;
      };
    }
  | {
      status: "success";
    };

export abstract class LoginUtils {
  private static createRequestId() {
    return crypto.randomUUID();
  }

  private static createBrowserToken() {
    return crypto.randomUUID();
  }

  private static createMagicLinkToken() {
    return crypto.randomUUID().replaceAll("-", "");
  }

  private static normalizeHost(host: string) {
    return host.split(":")[0]?.trim().toLowerCase() || "";
  }

  private static getCookieDomain(host: string) {
    const hostname = LoginUtils.normalizeHost(host);

    if (
      hostname === PROD_SHARED_DOMAIN ||
      hostname.endsWith(`.${PROD_SHARED_DOMAIN}`)
    ) {
      return `.${PROD_SHARED_DOMAIN}`;
    }

    if (
      hostname === DEV_SHARED_DOMAIN ||
      hostname.endsWith(`.${DEV_SHARED_DOMAIN}`)
    ) {
      return `.${DEV_SHARED_DOMAIN}`;
    }

    if (
      hostname === DEV_LOCALHOST_DOMAIN ||
      hostname.endsWith(`.${DEV_LOCALHOST_DOMAIN}`)
    ) {
      return `.${DEV_LOCALHOST_DOMAIN}`;
    }

    return undefined;
  }

  private static getCookieOptions(maxAge?: number) {
    const host = getRequestHost({ xForwardedHost: true });
    const protocol = getRequestProtocol({ xForwardedProto: true });
    const hostname = LoginUtils.normalizeHost(host);

    return {
      domain: LoginUtils.getCookieDomain(host),
      httpOnly: true,
      maxAge,
      path: "/",
      sameSite: "lax" as const,
      secure:
        protocol === "https" ||
        hostname === PROD_SHARED_DOMAIN ||
        hostname.endsWith(`.${PROD_SHARED_DOMAIN}`),
    };
  }

  private static async hashToken(value: string) {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value)
    );

    return Array.from(new Uint8Array(digest), (part) =>
      part.toString(16).padStart(2, "0")
    ).join("");
  }

  private static setTempSessionCookie(token: string) {
    setCookie(
      TEMP_SESSION_COOKIE_NAME,
      token,
      LoginUtils.getCookieOptions(15 * 60)
    );
  }

  static async handleLogin({ email }: { email: string }): Promise<LoginResult> {
    const requestId = LoginUtils.createRequestId();
    const rateLimit = await limiter.limit(email.toLowerCase(), {
      limit: 5,
      windowSeconds: 60 * 60,
    });

    if (!rateLimit.allowed) {
      return {
        status: "error",
        error: {
          code: "RATE_LIMITED",
          message: `Too many login attempts. Please wait until ${rateLimit.resetAt.toISOString()} and try again.`,
          requestId,
        },
      };
    }

    logger.info("Magic link login started", {
      email,
      requestId,
    });

    try {
      const user = await db.user.findFirst({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        logger.warn(
          "Magic link login rejected because account does not exist",
          {
            email,
            requestId,
          }
        );

        return {
          status: "error",
          error: {
            code: "ACCOUNT_NOT_FOUND",
            message: "We could not find an account for this email address.",
            requestId,
          },
        };
      }

      const token = LoginUtils.createMagicLinkToken();
      const tempSessionToken = LoginUtils.createBrowserToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const tokenHash = await LoginUtils.hashToken(token);
      const browserTokenHash = await LoginUtils.hashToken(tempSessionToken);

      console.log(
        "Magic link url:",
        `http://auth.selfmail.localhost:1355/magic?token=${token}`
      );

      await db.$transaction([
        db.magicLink.deleteMany({
          where: { email },
        }),
        db.magicLink.create({
          data: {
            browserTokenHash,
            email,
            token: tokenHash,
            expiresAt,
            userId: user.id,
          },
        }),
      ]);

      LoginUtils.setTempSessionCookie(tempSessionToken);

      logger.info("Magic link created", {
        email,
        requestId,
        expiresAt: expiresAt.toISOString(),
      });

      return {
        status: "success",
      };
    } catch (error) {
      logger.error(
        "Magic link login failed unexpectedly",
        error instanceof Error ? error : undefined,
        { email, requestId }
      );

      return {
        status: "error",
        error: {
          code: "UNKNOWN_ERROR",
          message:
            "We could not create a magic link right now. Please try again later.",
          requestId,
        },
      };
    }
  }
}
