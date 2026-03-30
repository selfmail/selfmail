import type { CookieOptions, RequestEventBase } from "@builder.io/qwik-city";
import type { User } from "database";
import { db } from "database";

const PROD_SHARED_DOMAIN = "selfmail.app";
const DEV_SHARED_DOMAIN = "selfmail.local";
const DEV_LOCALHOST_DOMAIN = "selfmail.localhost";
const DEFAULT_DEV_AUTH_ORIGIN = "http://auth.selfmail.local:1355";

export const SESSION_COOKIE_NAME = "selfmail-session-token";

type AuthenticationResult =
  | {
      authenticated: false;
      user?: undefined;
    }
  | {
      authenticated: true;
      user: User;
    };

const normalizeHost = (host: string) =>
  host.split(":")[0]?.trim().toLowerCase() || "";

const getCookieDomain = (host: string) => {
  const hostname = normalizeHost(host);

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

  return undefined;
};

const getAuthOrigin = (url: URL) => {
  const configuredOrigin = process.env.SELFMAIL_AUTH_URL?.trim();

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "");
  }

  const hostname = normalizeHost(url.host);

  if (
    hostname === PROD_SHARED_DOMAIN ||
    hostname.endsWith(`.${PROD_SHARED_DOMAIN}`)
  ) {
    return `https://auth.${PROD_SHARED_DOMAIN}`;
  }

  if (
    hostname === DEV_LOCALHOST_DOMAIN ||
    hostname.endsWith(`.${DEV_LOCALHOST_DOMAIN}`)
  ) {
    return `http://auth.${DEV_LOCALHOST_DOMAIN}:3010`;
  }

  if (
    hostname === DEV_SHARED_DOMAIN ||
    hostname.endsWith(`.${DEV_SHARED_DOMAIN}`) ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  ) {
    return DEFAULT_DEV_AUTH_ORIGIN;
  }

  return `${url.protocol}//${url.host}`;
};

const setSearchParams = (
  target: URL,
  searchParams?: URLSearchParams | Record<string, string | null | undefined>
) => {
  if (!searchParams) {
    return target;
  }

  if (searchParams instanceof URLSearchParams) {
    for (const [key, value] of searchParams) {
      target.searchParams.set(key, value);
    }

    return target;
  }

  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== null) {
      target.searchParams.set(key, value);
    }
  }

  return target;
};

const getSessionCookieOptions = (
  url: URL
): Pick<CookieOptions, "domain" | "path" | "sameSite"> => ({
  domain: getCookieDomain(url.host),
  path: "/",
  sameSite: "lax",
});

export const createAuthUrl = (
  url: URL,
  path: string,
  searchParams?: URLSearchParams | Record<string, string | null | undefined>
) =>
  setSearchParams(new URL(path, getAuthOrigin(url)), searchParams).toString();

export const createLoginUrl = (
  url: URL,
  searchParams?: URLSearchParams | Record<string, string | null | undefined>
) => createAuthUrl(url, "/login", searchParams);

export const createRegisterUrl = (
  url: URL,
  searchParams?: URLSearchParams | Record<string, string | null | undefined>
) => createAuthUrl(url, "/register", searchParams);

export const clearSessionCookie = (
  cookie: RequestEventBase["cookie"],
  url: URL
) => {
  cookie.delete(SESSION_COOKIE_NAME, getSessionCookieOptions(url));
};

export const hashToken = async (value: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );

  return Array.from(new Uint8Array(digest), (part) =>
    part.toString(16).padStart(2, "0")
  ).join("");
};

export const middlewareAuthentication = async (
  sessionToken: string | undefined
): Promise<AuthenticationResult> => {
  try {
    if (!sessionToken) {
      return {
        authenticated: false,
      };
    }

    const sessionTokenHash = await hashToken(sessionToken);
    const session = await db.session.findUnique({
      where: {
        sessionToken: sessionTokenHash,
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      return {
        authenticated: false,
      };
    }

    if (session.expires < new Date()) {
      await db.session.deleteMany({
        where: {
          sessionToken: sessionTokenHash,
        },
      });

      return {
        authenticated: false,
      };
    }

    return {
      authenticated: true,
      user: session.user,
    };
  } catch {
    return {
      authenticated: false,
    };
  }
};

export const verifyWorkspaceMembership = async (
  userId: string,
  workspaceSlug: string
) => {
  const workspace = await db.workspace.findUnique({
    where: {
      slug: workspaceSlug,
    },
  });

  if (!workspace) {
    return {
      isMember: false,
    };
  }

  const member = await db.member.findUnique({
    where: {
      userWorkspaceId: {
        userId,
        workspaceId: workspace.id,
      },
    },
    include: {
      MemberPermission: true,
    },
  });

  if (!member) {
    return {
      isMember: false,
    };
  }

  return {
    isMember: true,
    member,
    workspace,
  };
};
