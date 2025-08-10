import { db } from "database";
import Elysia, { status, t } from "elysia";
import z from "zod";
import { sessionAuthMiddleware } from "../../lib/auth-middleware";
import { AuthenticationModule } from "./module";
import { AuthenticationService } from "./service";

const sessionTokenSchema = t.Cookie({
  "session-token": t.String({
    description: "Session token for authentication",
  }),
});

export const requireAuthentication = new Elysia({
  name: "Auth.Service",
  detail: {
    description: "Authentication plugin for protected routes",
  },
})
  .macro({
    isSignIn: {
      async resolve({ cookie, status }) {
        if (!cookie["session-token"]?.value) return status(401);

        const authUser = await sessionAuthMiddleware({
          cookie: cookie["session-token"].value
            ? `session-token=${cookie["session-token"].value}`
            : "",
        });

        if (!authUser) {
          throw status(401, "Authentication required");
        }

        return { user: authUser };
      },
    },
  })
  .as("global");

export const requireWorkspaceMember = new Elysia({
  name: "RequireWorkspaceMember",
  detail: {
    description: "Middleware to ensure the user is a member of a workspace.",
  },
})
  .use(requireAuthentication)
  .guard(
    {
      isSignIn: true,
      body: t.Object({
        workspaceId: t.String({
          description: "ID of the workspace to check membership for",
        }),
      }),
    },
    (app) =>
      app.macro({
        workspaceMember: {
          async resolve({ user, body }) {
            const parse = await z
              .object({
                workspaceId: z
                  .string()
                  .describe("ID of the workspace to check permissions for"),
              })
              .safeParseAsync(body);

            if (!user || !parse.success)
              throw status(401, "Authentication required");

            const { workspaceId } = parse.data;

            const member = await db.member.findFirst({
              where: {
                userId: user.id,
                workspaceId: workspaceId,
              },
              select: {
                id: true,
              },
            });
            if (!member) {
              throw status(403, "User is not a member of the workspace");
            }
            return { member };
          },
        },
      }),
  )
  .as("global");

export const authentication = new Elysia({
  prefix: "/authentication",
  detail: {
    description: "Authentication endpoints for user registration and login.",
  },
})
  .post(
    "/login",
    async ({ body, request, cookie }) => {
      const clientIp =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";

      const result = await AuthenticationService.handleLogin(body, clientIp);

      cookie["session-token"].value = result.sessionToken;
      cookie["session-token"].httpOnly = true;
      cookie["session-token"].secure = true;
      cookie["session-token"].sameSite = "strict";
      cookie["session-token"].path = "/";
      cookie["session-token"].maxAge = 604800; // 7 days

      return result;
    },
    {
      body: AuthenticationModule.loginBody,
      detail: {
        description: "Login with email and password",
      },
      cookie: sessionTokenSchema,
    },
  )
  .post(
    "/register",
    async ({ body, request, cookie }) => {
      const clientIp =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";

      const result = await AuthenticationService.handleRegister(body, clientIp);

      cookie["session-token"].value = result.sessionToken;
      cookie["session-token"].httpOnly = true;
      cookie["session-token"].secure = true;
      cookie["session-token"].sameSite = "strict";
      cookie["session-token"].path = "/";
      cookie["session-token"].maxAge = 604800; // 7 days

      return result;
    },
    {
      body: AuthenticationModule.registerBody,
      detail: {
        description: "Register a new user account",
      },
      cookie: sessionTokenSchema,
    },
  )
  .post(
    "/logout",
    async ({ cookie }) => {
      const sessionToken = cookie["session-token"]?.value;

      if (!sessionToken) {
        throw status(401, "Not authenticated");
      }

      if (sessionToken) {
        await AuthenticationService.handleLogout(sessionToken);
      }

      cookie["session-token"].remove();

      return { success: true, message: "Logged out successfully" };
    },
    {
      detail: {
        description: "Logout and clear session",
      },
      cookie: sessionTokenSchema,
    },
  )
  .use(requireAuthentication)
  .use(requireWorkspaceMember)
  .get("/me", async ({ user }) => user, {
    detail: {
      description: "Get current user information",
    },
    cookie: sessionTokenSchema,
    isSignIn: true,
    workspaceMember: true,
  });
