import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2Icon, KeyRoundIcon } from "lucide-react";
import type { ReactNode } from "react";
import { type ZodError, z } from "zod";
import { Google } from "#/components/ui/svgs/google";
import { handleLoginForm } from "#/lib/login";
import { m } from "#/paraglide/messages";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const EmailField = ({ placeholder }: { placeholder: string }) => {
  const field = useFieldContext<string>();
  const [firstError] = field.state.meta.errors as ZodError[];

  return (
    <div>
      <input
        className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(event) => {
          field.handleChange(event.target.value);
        }}
        placeholder={placeholder}
        type="email"
        value={field.state.value}
      />
      {firstError ? (
        <p className="px-2 pt-1 text-red-600 text-sm">
          {String(firstError.message)}
        </p>
      ) : null}
    </div>
  );
};

const SubmitButton = ({ children }: { children: ReactNode }) => {
  const form = useFormContext();

  return (
    <button
      className="hit-area-2 w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 text-white transition-colors duration-200 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 hover:bg-neutral-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
      disabled={form.state.isSubmitting}
      type="submit"
    >
      {children}
    </button>
  );
};

const { useAppForm } = createFormHook({
  fieldComponents: {
    EmailField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});

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
});

function RouteComponent() {
  const loginSchema = z.object({
    email: z
      .email(m["login.errors.email_invalid"]())
      .min(1, m["login.errors.email_required"]()),
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async (values) => {
      await handleLoginForm({
        data: values.value,
      });
    },
    validators: {
      onBlur: loginSchema,
      onSubmit: loginSchema,
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
          encType="multipart/form-data"
          method="post"
          onSubmit={(e) => {
            form.handleSubmit();

            e.preventDefault();
          }}
        >
          <form.AppField name="email">
            {(field) => (
              <field.EmailField placeholder={m["login.email_placeholder"]()} />
            )}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton>{m["login.proceed_button"]()}</form.SubmitButton>
          </form.AppForm>
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
