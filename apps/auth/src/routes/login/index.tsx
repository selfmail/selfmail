import { Input } from "@selfmail/ui";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Building2Icon, KeyRoundIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import EnterpriseWorkInProgressDialog from "#/components/EnterpriseWorkInProgressDialog";
import { Google } from "#/components/ui/svgs/google";
import { getAppRedirectUrlFn, getCurrentUserFn } from "#/libs/session";
import { m } from "#/paraglide/messages";
import { handleLoginForm } from "#/utils/login";

export const Route = createFileRoute("/login/")({
  head: () => ({
    meta: [
      { title: m["meta.login.title"]() },
      {
        name: "description",
        content: m["meta.login.description"](),
      },
    ],
  }),
  component: RouteComponent,
  loader: async () => ({
    currentUser: await getCurrentUserFn(),
    dashboardUrl: await getAppRedirectUrlFn(),
  }),
  validateSearch: z.object({
    error: z.string().optional(),
  }),
});

const DashboardHint = ({ dashboardUrl }: { dashboardUrl: string }) => {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-700 text-sm">
      <div className="flex items-start gap-3">
        <p className="flex-1 text-pretty">
          {m["login.dashboard_hint.text"]()}{" "}
          <a
            className="font-medium text-neutral-900 underline underline-offset-2"
            href={dashboardUrl}
          >
            {m["login.dashboard_hint.link"]()}
          </a>
          .
        </p>
      </div>
    </div>
  );
};

function RouteComponent() {
  const { error: routeError } = Route.useSearch();
  const [error, setError] = useState<string | null>(routeError ?? null);
  const { currentUser, dashboardUrl } = Route.useLoaderData();
  const [emailError, setEmailError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (data: FormData) => {
      const email = data.get("email");
      const parse = z.email().parse(email);
      return handleLoginForm({
        data: { email: parse },
      });
    },
    onError: (error) => {
      if (error instanceof z.ZodError) {
        setEmailError("Email is invalid.");
      } else {
        setError("Error occurred. Please try again later.");
      }
    },
    onSuccess: async (_, values) => {
      await navigate({
        to: "/login/success",
        search: {
          email: values.get("email") as string,
        },
      });
    },
  });

  const onSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    loginMutation.mutate(formData);
  };

  return (
    <>
      <a
        className="absolute top-5 hidden font-medium text-xl sm:block"
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
          method="post"
          noValidate
          onSubmit={onSubmit}
        >
          {currentUser && <DashboardHint dashboardUrl={dashboardUrl} />}
          {error ? (
            <div
              aria-live="polite"
              className="text-pretty rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm"
              role="alert"
            >
              {error}
            </div>
          ) : null}
          <Input
            name="email"
            placeholder={m["login.email_placeholder"]()}
            required
            type="email"
          />
          {emailError && (
            <p className="mt-1 text-red-500 text-sm">{emailError}</p>
          )}
          <button
            className="hit-area-2 w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 text-white transition-colors duration-200 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 hover:bg-neutral-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            disabled={loginMutation.isPending}
            type="submit"
          >
            {m["login.proceed_button"]()}
          </button>
          <div className="h-0.5 w-full rounded-full bg-neutral-200" />
          <div className="flex flex-col gap-2">
            <a
              className="relative flex w-full cursor-pointer items-center justify-start rounded-full border-2 border-neutral-200 px-6 py-3 transition-colors duration-200 hover:bg-neutral-100"
              href="/api/login/google"
            >
              <Google className="absolute left-6 h-4 w-4" />
              <span className="ml-8 w-full text-left">
                {m["login.sign_in_google"]()}
              </span>
            </a>
            <button
              className="relative flex w-full cursor-pointer items-center justify-start rounded-full border-2 border-neutral-200 px-6 py-3 transition-colors duration-200 hover:bg-neutral-100"
              type="button"
            >
              <KeyRoundIcon className="absolute left-6 h-4 w-4" />

              <span className="ml-8 w-full text-left">
                {m["login.sign_in_passkey"]()}
              </span>
            </button>
            <EnterpriseWorkInProgressDialog>
              <button
                className="relative flex w-full cursor-pointer items-center justify-start rounded-full border-2 border-neutral-200 px-6 py-3 transition-colors duration-200 hover:bg-neutral-100"
                type="button"
              >
                <Building2Icon className="absolute left-6 h-4 w-4" />

                <span className="ml-8 w-full text-left">
                  {m["login.enterprises"]()}
                </span>
              </button>
            </EnterpriseWorkInProgressDialog>
          </div>
          <p className="pt-4 text-center">
            {m["login.register_text"]()}{" "}
            <a
              className="hit-area-2 text-blue-500 hover:underline"
              href={"/register"}
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
