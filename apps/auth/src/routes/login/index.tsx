import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login/")({
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
        <h1 className="pb-4 text-center font-medium text-3xl">Welcome Back!</h1>
        <form className="flex flex-col gap-4 pt-2">
          <input
            className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
            placeholder="Ihre Email Adresse"
            type="email"
          />
          <button
            className="2 w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 text-white transition-colors duration-200 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 hover:bg-neutral-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            type="submit"
          >
            Proceed
          </button>
          <div className="h-0.5 w-full rounded-full bg-neutral-200" />
          <div className="flex flex-col gap-2">
            <button
              className="cursor-pointer rounded-full border-2 border-neutral-200 px-6 py-3 transition-colors duration-200 hover:bg-neutral-100"
              type="button"
            >
              Sign in with Google
            </button>
            <button
              className="cursor-pointer rounded-full border-2 border-neutral-200 px-6 py-3 transition-colors duration-200 hover:bg-neutral-100"
              type="button"
            >
              Sign in with Passkey
            </button>
            <button
              className="cursor-pointer rounded-full border-2 border-neutral-200 px-6 py-3 transition-colors duration-200 hover:bg-neutral-100"
              type="button"
            >
              Enterprises
            </button>
          </div>
          <p className="pt-4 text-center">
            Don't have an Account?{" "}
            <a className="text-blue-500 hover:underline" href="/register">
              Register here
            </a>
          </p>
          <p className="neutral-700 text-balance text-center text-sm">
            By signing in, you agree to our{" "}
            <a className="text-blue-500 hover:underline" href="/terms">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="text-blue-500 hover:underline" href="/privacy">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </div>
    </>
  );
}
