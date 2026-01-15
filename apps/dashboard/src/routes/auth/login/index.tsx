import { component$, useSignal } from "@builder.io/qwik";
import {
  type DocumentHead,
  Link,
  routeAction$,
  routeLoader$,
  useLocation,
} from "@builder.io/qwik-city";
import { LuGithub, LuMail } from "@qwikest/icons/lucide";
import { generateState } from "arctic";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { middlewareAuthentication } from "~/lib/auth";
import { github, google } from "~/lib/oauth";
import { useSendMagicLink } from "../../../lib/magic-link/send";

export const useGithubLogin = routeAction$((_, { cookie, redirect }) => {
  const state = generateState();

  cookie.set("github_oauth_state", state, {
    path: "/",
    httpOnly: true,
    secure: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  const url = github.createAuthorizationURL(state, ["user:email"]);
  throw redirect(302, url.toString());
});

export const useGoogleLogin = routeAction$((_, { cookie, redirect }) => {
  const state = generateState();
  const codeVerifier = generateState();

  cookie.set("google_oauth_state", state, {
    path: "/",
    httpOnly: true,
    secure: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  cookie.set("google_code_verifier", codeVerifier, {
    path: "/",
    httpOnly: true,
    secure: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "email",
    "profile",
  ]);
  throw redirect(302, url.toString());
});

const useAlreadyLoggedIn = routeLoader$(async ({ cookie }) => {
  const sessionToken = cookie.get("selfmail-session-token")?.value;

  if (!sessionToken) {
    return { isLoggedIn: false, user: null };
  }

  const { authenticated, user } = await middlewareAuthentication(sessionToken);
  if (!(authenticated && user)) {
    return { isLoggedIn: false, user: null };
  }
  return {
    isLoggedIn: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
});

export const useCheckInvitation = routeLoader$(({ url }) => {
  const invitationToken = url.searchParams.get("invitationToken");
  return { invitationToken };
});

export default component$(() => {
  const location = useLocation();
  const user = useAlreadyLoggedIn();
  const githubLogin = useGithubLogin();
  const googleLogin = useGoogleLogin();
  const sendMagicLink = useSendMagicLink();
  const invitation = useCheckInvitation();
  const emailSent = useSignal(false);

  const invitationParam = invitation.value.invitationToken
    ? `?invitationToken=${invitation.value.invitationToken}`
    : "";

  return (
    <div class="flex min-h-dvh w-full items-center justify-center bg-neutral-50">
      <div class="flex w-full max-w-md flex-col gap-6 p-6">
        {location.url.searchParams.get("success") && (
          <div class="rounded-lg border border-green-200 bg-green-50 p-4">
            <p class="text-green-800 text-sm">
              {location.url.searchParams.get("success")}
            </p>
          </div>
        )}

        {location.url.searchParams.get("error") && (
          <div class="rounded-lg border border-red-200 bg-red-50 p-4">
            <p class="text-red-800 text-sm">
              {location.url.searchParams.get("error")}
            </p>
          </div>
        )}

        {user.value.user && user.value.isLoggedIn && (
          <Link
            class="rounded-lg border border-blue-200 bg-blue-50 p-4 hover:bg-blue-100"
            href="/"
          >
            <p class="text-blue-800 text-sm">
              Welcome back, {user.value.user.name}! You are already logged in.
              Click here to go to your dashboard.
            </p>
          </Link>
        )}

        {emailSent.value && (
          <div class="rounded-lg border border-green-200 bg-green-50 p-4">
            <p class="text-green-800 text-sm">
              Check your email! We've sent you a magic link to sign in.
            </p>
          </div>
        )}

        <div class="flex flex-col gap-2">
          <h1 class="font-semibold text-3xl">Welcome back</h1>
          <p class="text-neutral-600 text-sm">
            Sign in to your Selfmail account
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <form
            onSubmit$={async () => {
              await githubLogin.submit();
            }}
            preventdefault:submit
          >
            <Button
              class="w-full gap-2 border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100"
              disabled={githubLogin.isRunning}
              type="submit"
            >
              <LuGithub class="size-5 text-neutral-900" />
              Continue with GitHub
            </Button>
          </form>

          <form
            onSubmit$={async () => {
              await googleLogin.submit();
            }}
            preventdefault:submit
          >
            <Button
              class="w-full gap-2 border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100"
              disabled={googleLogin.isRunning}
              type="submit"
            >
              <svg class="size-5" viewBox="0 0 24 24">
                <title>Google</title>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </form>

          <div class="relative my-2">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-neutral-200 border-t" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-neutral-50 px-2 text-neutral-500">
                Or continue with
              </span>
            </div>
          </div>

          <form
            onSubmit$={async (e) => {
              const formData = new FormData(e.target as HTMLFormElement);
              const email = formData.get("email");
              if (email) {
                await sendMagicLink.submit({ email: email as string });
                emailSent.value = true;
              }
            }}
            preventdefault:submit
          >
            <div class="flex gap-2">
              <Input
                class="flex-1 bg-white"
                name="email"
                placeholder="Enter your email"
                required
                type="email"
              />
              <Button
                class="gap-2"
                disabled={sendMagicLink.isRunning}
                type="submit"
              >
                <LuMail class="size-4" />
                Send link
              </Button>
            </div>
          </form>
        </div>

        <p class="text-center text-neutral-500 text-xs">
          By continuing, you agree to our{" "}
          <a class="underline" href="https://selfmail.app/terms">
            Terms of Service
          </a>{" "}
          and{" "}
          <a class="underline" href="https://selfmail.app/privacy">
            Privacy Policy
          </a>
        </p>

        <p class="text-center text-neutral-600 text-sm">
          Don't have an account?{" "}
          <Link
            class="text-blue-600 underline"
            href={`/auth/register${invitationParam}`}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Login - Selfmail",
  meta: [
    {
      name: "description",
      content:
        "Log in to your Selfmail Account. Sign in with GitHub, Google, or email magic link.",
    },
    {
      property: "og:title",
      content: "Login - Selfmail",
    },
    {
      property: "og:description",
      content: "Log in to your Selfmail Account.",
    },
  ],
};
