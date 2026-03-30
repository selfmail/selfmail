import { createFileRoute } from "@tanstack/react-router";
import { getCurrentUserFn, getLoginHref } from "#/lib/auth";

export const Route = createFileRoute("/")({
  loader: async () => ({
    loginHref: getLoginHref(),
    user: await getCurrentUserFn(),
  }),
  component: HomePage,
});

function HomePage() {
  const { loginHref, user } = Route.useLoaderData();

  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-[2rem] p-6 sm:p-8">
        <p className="island-kicker mb-3">Auth Check</p>
        <h1 className="display-title text-balance text-4xl text-[var(--sea-ink)] sm:text-5xl">
          {user ? `Hello ${user.name ?? user.email}` : "No valid session"}
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-[var(--sea-ink-soft)]">
          {user
            ? "The shared auth cookie is valid, so you can now build your own TanStack pages on top of this route structure."
            : "No valid auth cookie was found for this browser yet. Sign in through the auth app first, then this page will show the current user."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-5 py-2.5 font-semibold text-[var(--sea-ink)] no-underline"
            href={loginHref}
          >
            Open auth app
          </a>
          {user ? (
            <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2.5 text-[var(--sea-ink-soft)] text-sm">
              {user.email}
            </span>
          ) : null}
        </div>
      </section>
    </main>
  );
}
