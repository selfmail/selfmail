import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2Icon } from "lucide-react";
import { Google } from "#/components/ui/svgs/google";

export const Route = createFileRoute("/register/")({
  component: RouteComponent,
  beforeLoad() {
    // Check for any active session before showing page
  },
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    await navigate({ to: "/register/success" });
  };

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
          Create Your Account
        </h1>
        <form className="flex flex-col gap-4 pt-2" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
            placeholder="Your Full Name"
            type="text"
          />
          <input
            className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
            placeholder="Your E-Mail Address"
            type="email"
          />
          <input
            className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
            placeholder="Create a Password"
            type="password"
          />
          <button
            className="hit-area-4 w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 text-white transition-colors duration-200 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 hover:bg-neutral-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            type="submit"
          >
            Create Account
          </button>
          <div className="h-0.5 w-full rounded-full bg-neutral-200" />
          <div className="flex flex-col gap-2">
            <button
              className="relative flex w-full cursor-pointer items-center justify-start rounded-full border-2 border-neutral-200 px-6 py-3 transition-colors duration-200 hover:bg-neutral-100"
              type="button"
            >
              <Google className="absolute left-6 h-4 w-4" />
              <span className="ml-8 w-full text-left">Sign in with Google</span>
            </button>
            <button
              className="relative flex w-full cursor-pointer items-center justify-start rounded-full border-2 border-neutral-200 px-6 py-3 transition-colors duration-200 hover:bg-neutral-100"
              type="button"
            >
              <Building2Icon className="absolute left-6 h-4 w-4" />

              <span className="ml-8 w-full text-left">Enterprise Setup</span>
            </button>
          </div>
          <p className="pt-4 text-center">
            Already have an Account?{" "}
            <a
              className="hit-area-2 text-blue-500 hover:underline"
              href="/login"
            >
              Sign in here
            </a>
          </p>
          <p className="text-balance text-center text-neutral-700 text-sm">
            By creating an account, you agree to our{" "}
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
