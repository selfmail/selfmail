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
import GoogleIcon from "~/components/icons/google.svg?jsx";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
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

export const useCheckInvitation = routeLoader$(({ url }) => {
  const invitationToken = url.searchParams.get("invitationToken");
  return { invitationToken };
});

export default component$(() => {
  const location = useLocation();
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
        {location.url.searchParams.get("error") && (
          <div class="rounded-lg border border-red-200 bg-red-50 p-4">
            <p class="text-red-800 text-sm">
              {location.url.searchParams.get("error")}
            </p>
          </div>
        )}

        {emailSent.value && (
          <div class="rounded-lg border border-green-200 bg-green-50 p-4">
            <p class="text-green-800 text-sm">
              Check your email! We've sent you a magic link to sign in.
            </p>
          </div>
        )}

        <div class="flex flex-col gap-2">
          <h1 class="font-semibold text-3xl">Create an account</h1>
          <p class="text-neutral-600 text-sm">
            Get started with Selfmail today
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
              <span class="font-bold">Continue with GitHub</span>
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
              <GoogleIcon class="size-5" />
              <span class="font-bold">Continue with Google</span>
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
          Already have an account?{" "}
          <Link
            class="text-blue-600 underline"
            href={`/auth/login${invitationParam}`}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Create Account - Selfmail",
  meta: [
    {
      name: "description",
      content:
        "Create a new Selfmail account. Sign up with GitHub, Google, or email to get started with our open-source business email platform.",
    },
    {
      property: "og:title",
      content: "Create Account - Selfmail",
    },
    {
      property: "og:description",
      content: "Create a new Selfmail account and get started today.",
    },
  ],
};
