import { createFileRoute, Link } from "@tanstack/react-router";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/otp/backup-codes/")({
  head: () => ({
    meta: [
      { title: m["meta.otp_backup.title"]() },
      {
        name: "description",
        content: m["meta.otp_backup.description"](),
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <a
        className="absolute top-5 hidden font-medium text-xl sm:block"
        href="https://selfmail.app"
      >
        Selfmail
      </a>
      <div className="flex w-full flex-col gap-2 px-5 sm:px-10 md:w-100 md:px-0">
        <h1 className="pb-2 text-center font-medium text-3xl">
          {m["otp_backup.title"]()}
        </h1>
        <p className="text-balance pb-4 text-center text-neutral-700 text-sm">
          {m["otp_backup.description"]()}
        </p>
        <form className="flex flex-col gap-4 pt-2">
          <input
            className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
            placeholder={m["otp_backup.code_placeholder"]()}
            type="text"
          />
          <button
            className="hit-area-4 w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 text-white transition-colors duration-200 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 hover:bg-neutral-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            type="submit"
          >
            {m["otp_backup.submit_button"]()}
          </button>
          <div className="h-0.5 w-full rounded-full bg-neutral-200" />
          <p className="text-balance text-center">
            {m["otp_backup.otp_before_link"]()}{" "}
            <Link
              className="hit-area-2 text-blue-500 hover:underline"
              to="/otp"
            >
              {m["otp_backup.otp_link"]()}
            </Link>
          </p>
          <p className="text-balance text-center text-neutral-700 text-sm">
            {m["otp_backup.support_before_link"]()}{" "}
            <Link className="text-blue-500 hover:underline" to="/contact">
              {m["otp_backup.support_link"]()}
            </Link>{" "}
            {m["otp_backup.support_after_link"]()}
          </p>
        </form>
      </div>
    </>
  );
}
