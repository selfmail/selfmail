import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register/success/")({
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
        <h1 className="text-balance pb-2 text-center font-medium text-3xl">
          Account Created Successfully - Check your Inbox
        </h1>
        <p className="text-balance pb-4 text-center text-neutral-700 text-sm">
          Everything went alright. We sent a verification email with a magic
          link to your inbox. Please open it and click the link to verify your
          email address.
        </p>
      </div>
    </>
  );
}
