import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/otp/backup-codes/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <a
        className="absolute top-5 font-medium text-xl"
        href="https://selfmail.app"
      >
        Selfmail
      </a>
      <div className="flex w-full flex-col gap-2 px-5 sm:px-10 md:w-100 md:px-0">
        <h1 className="pb-2 text-center font-medium text-3xl">
          Use Backup Code
        </h1>
        <p className="text-balance pb-4 text-center text-neutral-700 text-sm">
          Enter one of your saved backup codes to continue signing in if you no
          longer have access to your authenticator app.
        </p>
        <form className="flex flex-col gap-4 pt-2">
          <input
            className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
            placeholder="Enter backup code"
            type="text"
          />
          <button
            className="hit-area-4 w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 text-white transition-colors duration-200 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 hover:bg-neutral-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            type="submit"
          >
            Verify Backup Code
          </button>
          <div className="h-0.5 w-full rounded-full bg-neutral-200" />
          <p className="text-balance text-center">
            Found your authenticator app again?{" "}
            <Link
              className="hit-area-2 text-blue-500 hover:underline"
              to="/otp"
            >
              Go back to OTP login
            </Link>
          </p>
          <p className="text-balance text-center text-neutral-700 text-sm">
            Don't have access to your backup codes? Please{" "}
            <Link className="text-blue-500 hover:underline" to="/contact">
              contact support
            </Link>{" "}
            for further assistance.
          </p>
        </form>
      </div>
    </>
  );
}
