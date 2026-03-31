import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Agentation } from "agentation";
import { getLocale } from "#/paraglide/runtime";
import PostHogProvider from "../integrations/posthog/provider";

import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Selfmail",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <main className="flex min-h-screen items-center justify-center">
      <h2 className="text-2xl">Page Not Found</h2>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="flex min-h-screen items-center justify-center">
      <div>
        <h2 className="text-2xl">An error occurred</h2>
        <pre className="mt-4 max-w-sm rounded bg-red-50 p-4 text-red-700 text-sm">
          {error.message}
        </pre>
      </div>
    </main>
  ),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint: we need this script in order to get the themes working correctly, injected by the tanstack boilerplate code */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="wrap-anywhere font-sans antialiased">
        <PostHogProvider>
          {children}
          {process.env.NODE_ENV === "development" && <Agentation />}
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </PostHogProvider>
        <Scripts />
      </body>
    </html>
  );
}
