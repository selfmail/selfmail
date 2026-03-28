import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { resendRegisterVerificationFn } from "#/lib/register";
import { m } from "#/paraglide/messages";

const successSearchSchema = z.object({
  email: z
    .string()
    .trim()
    .optional()
    .transform((email) => {
      if (!email) {
        return undefined;
      }

      const normalizedEmail = email.toLowerCase();

      return z.string().email().safeParse(normalizedEmail).success
        ? normalizedEmail
        : undefined;
    }),
});

export const Route = createFileRoute("/register/success/")({
  head: () => ({
    meta: [
      { title: m["meta.register_success.title"]() },
      {
        name: "description",
        content: m["meta.register_success.description"](),
      },
    ],
  }),
  validateSearch: successSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { email } = Route.useSearch();
  const [isResending, setIsResending] = useState(false);

  const canResend = Boolean(email);

  return (
    <>
      <a
        className="absolute top-5 hidden font-medium text-xl sm:block"
        href="https://selfmail.app"
      >
        Selfmail
      </a>
      <div className="flex w-full flex-col gap-2 px-5 sm:px-10 md:w-100 md:px-0">
        <h1 className="text-balance pb-2 text-center font-medium text-3xl">
          {m["register_success.title"]()}
        </h1>
        <p className="text-balance pb-4 text-center text-neutral-700 text-sm">
          {m["register_success.description"]()}
        </p>
        <button
          className="hit-area-4 w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 text-white transition-colors duration-200 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 hover:bg-neutral-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
          disabled={!canResend || isResending}
          onClick={async () => {
            if (!email) {
              return;
            }

            setIsResending(true);
            try {
              await resendRegisterVerificationFn({
                data: {
                  email,
                },
              });
            } finally {
              setIsResending(false);
            }
          }}
          type="button"
        >
          {m["register_success.resend"]()}
        </button>
      </div>
    </>
  );
}
