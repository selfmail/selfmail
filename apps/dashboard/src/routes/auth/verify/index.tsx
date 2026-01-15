import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link, type RequestHandler, z } from "@builder.io/qwik-city";
import { db } from "database";

export const onGet: RequestHandler = async ({ next, query, redirect }) => {
  const queryParse = await z
    .object({
      token: z
        .string()
        .min(32, "Token is required/invalid")
        .max(33, "Token is invalid"),
    })
    .safeParseAsync(Object.fromEntries(query.entries()));

  if (!queryParse.success) {
    throw await next();
  }

  const token = await db.emailVerification.findUnique({
    where: {
      token: queryParse.data.token,
    },
  });

  if (!token || token.expiresAt < new Date()) {
    throw redirect(
      302,
      "/auth/login?error=Invalid%20or%20expired%20verification%20link"
    );
  }

  await db.user.update({
    where: {
      id: token.userId,
    },
    data: {
      emailVerified: new Date(),
    },
  });

  await db.emailVerification.deleteMany({
    where: {
      userId: token.userId,
    },
  });

  throw redirect(
    302,
    "/auth/login?success=Your%20email%20has%20been%20verified%20successfully"
  );
};

export default component$(() => {
  return (
    <div class="flex min-h-screen w-full flex-col items-center justify-center">
      <div class="flex w-full max-w-md flex-col gap-2">
        <h1 class="font-medium text-2xl">Verify your email</h1>
        <p class="text-neutral-500 text-sm">
          We have send you a verification link to your email. Please click{" "}
          <b>on the link inside the email</b>. Also check your spam folder in
          case you can't find the email. If you receive any error, you can
          either{" "}
          <Link class="text-blue-500" href="/auth/resend-verification">
            try it again
          </Link>{" "}
          or{" "}
          <a class="text-blue-500" href="mailto:support@selfmail.app">
            contact the support
          </a>
          .
        </p>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Email Verified | Selfmail",
  meta: [
    {
      name: "description",
      content:
        "Your email has been successfully verified. You can now log in to your Selfmail account.",
    },
    {
      property: "og:title",
      content: "Email Verified | Selfmail",
    },
    {
      property: "og:description",
      content:
        "Your email has been successfully verified. You can now log in to your Selfmail account.",
    },
    {
      property: "og:type",
      content: "website",
    },
  ],
  links: [
    {
      rel: "canonical",
      href: "https://app.selfmail.com/auth/verify",
    },
  ],
};
