import { createFileRoute } from "@tanstack/react-router";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/register/success/")({
  head: () => ({
    meta: [
      { title: m["meta.register_success.title"]() },
      {
        name: "description",
        content: m["meta.register_success.description"](),
      },
    ],
  }),
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
          {m["register_success.title"]()}
        </h1>
        <p className="text-balance pb-4 text-center text-neutral-700 text-sm">
          {m["register_success.description"]()}
        </p>
      </div>
    </>
  );
}
