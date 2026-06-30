import { Link } from "@tanstack/react-router";

export default function SignInInviteComponent() {
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
          You got an invite! Sign in to continue.
        </h1>
        <Link
          className="flex w-full flex-col gap-1 rounded-xl border border-border bg-muted p-4"
          to="/register"
        >
          <h2 className="text-black text-lg dark:text-white">Register</h2>
          <p className="text-muted-foreground text-sm">
            Don't have an account? Sign up to get started.
          </p>
        </Link>
        <Link
          className="flex w-full flex-col gap-1 rounded-xl border border-border bg-muted p-4"
          to="/login"
        >
          <h2 className="text-black text-lg dark:text-white">Login</h2>
          <p className="text-muted-foreground text-sm">
            Already have an account? Sign in to continue.
          </p>
        </Link>
      </div>
    </>
  );
}
