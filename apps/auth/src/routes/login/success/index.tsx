import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { m } from "#/paraglide/messages";
import { resendMagicLinkEmail } from "#/utils/resend-magic-link";

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
  redirect: z
    .string()
    .optional()
    .transform((redirect) =>
      redirect?.startsWith("/") && !redirect.startsWith("//")
        ? redirect
        : undefined
    ),
});

export const Route = createFileRoute("/login/success/")({
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
  const [error, setError] = useState<string | undefined>(undefined);

  const resend = useMutation({
    mutationFn: () => {
      if (!email) {
        throw new Error("Email is required to resend the magic link.");
      }
      return resendMagicLinkEmail({
        data: {
          email,
        },
      });
    },
    onError: (err) => {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    },
  });

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
          {m["login_success.title"]()}
        </h1>
        <p className="text-balance pb-4 text-center text-neutral-700 text-sm">
          {m["login_success.description"]()}
        </p>
        <button
          className="hit-area-2 w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 text-white transition-colors duration-200 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 hover:bg-neutral-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
          disabled={!email || resend.isPending}
          onClick={() => {
            if (!email) {
              return;
            }

            resend.mutate();
          }}
          type="button"
        >
          {m["login_success.resend"]()}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </>
  );
}
