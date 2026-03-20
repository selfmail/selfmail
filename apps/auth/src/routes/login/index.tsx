import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Building2Icon, KeyRoundIcon } from "lucide-react";
import { useState } from "react";
import { Google } from "#/components/ui/svgs/google";
import { loginFn } from "#/lib/login";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/login/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState("");
  const mutation = useMutation({
    mutationFn: loginFn,
    onSuccess: () => {
      // Redirect to dashboard or home page after successful login
      throw redirect({
        to: "https://selfmail.app",
      });
    },
  });
  return (
    <>
      <a
        className="absolute top-5 font-medium text-xl"
        href="https://selfmail.app"
      >
        Selfmail
      </a>
      <div className="flex w-full flex-col gap-2 px-5 sm:px-10 md:w-100 md:px-0">
        <h1 className="pb-4 text-center font-medium text-3xl">
          {m["login.title"]()}
        </h1>
        <form
          className="flex flex-col gap-4 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate({ data: { email } });
          }}
        >
          <input
            className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
            onChange={(e) => setEmail(e.target.value)}
            placeholder={m["login.email_placeholder"]()}
            type="email"
            value={email}
          />
          <button
            className="2 hit-area-2 w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 text-white transition-colors duration-200 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 hover:bg-neutral-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            type="submit"
          >
            {m["login.proceed_button"]()}
          </button>
          <div className="h-0.5 w-full rounded-full bg-neutral-200" />
          <div className="flex flex-col gap-2">
            <button
              className="relative flex w-full cursor-pointer items-center justify-start rounded-full border-2 border-neutral-200 px-6 py-3 transition-colors duration-200 hover:bg-neutral-100"
              type="button"
            >
              <Google className="absolute left-6 h-4 w-4" />
              <span className="ml-8 w-full text-left">
                {m["login.sign_in_google"]()}
              </span>
            </button>
            <button
              className="relative flex w-full cursor-pointer items-center justify-start rounded-full border-2 border-neutral-200 px-6 py-3 transition-colors duration-200 hover:bg-neutral-100"
              type="button"
            >
              <KeyRoundIcon className="absolute left-6 h-4 w-4" />

              <span className="ml-8 w-full text-left">
                {m["login.sign_in_passkey"]()}
              </span>
            </button>
            <button
              className="relative flex w-full cursor-pointer items-center justify-start rounded-full border-2 border-neutral-200 px-6 py-3 transition-colors duration-200 hover:bg-neutral-100"
              type="button"
            >
              <Building2Icon className="absolute left-6 h-4 w-4" />

              <span className="ml-8 w-full text-left">
                {m["login.enterprises"]()}
              </span>
            </button>
          </div>
          <p className="pt-4 text-center">
            {m["login.register_text"]()}{" "}
            <a
              className="hit-area-2 text-blue-500 hover:underline"
              href="/register"
            >
              {m["login.register_link"]()}
            </a>
          </p>
          <p className="text-balance text-center text-neutral-700 text-sm">
            {m["login.problems.text"]()}{" "}
            <Link
              className="hit-area-2 text-blue-500 hover:underline"
              to="/help"
            >
              {m["login.problems.get_help_link"]()}
            </Link>{" "}
            {m["login.problems.or"]()}{" "}
            <Link
              className="hit-area-2 text-blue-500 hover:underline"
              to="/contact"
            >
              {m["login.problems.contact_support_link"]()}
            </Link>
            .
          </p>
        </form>
      </div>
    </>
  );
}
