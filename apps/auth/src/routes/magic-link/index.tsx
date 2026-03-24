import { createFileRoute } from "@tanstack/react-router";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/magic-link/")({
  head: () => ({
    meta: [
      { title: m["meta.magic_link.title"]() },
      {
        name: "description",
        content: m["meta.magic_link.description"](),
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
          {m["magic_link.title"]()}
        </h1>
        <p className="text-balance pb-4 text-center text-neutral-700 text-sm">
          {m["magic_link.description"]()}
        </p>
        <a
          className="hit-area-4 w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 text-center text-white transition-colors duration-200 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 hover:bg-neutral-700 focus:outline-none"
          href="https://selfmail.app"
        >
          {m["magic_link.cta"]()}
        </a>
      </div>
    </>
  );
}
