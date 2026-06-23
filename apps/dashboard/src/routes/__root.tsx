import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Agentation } from "agentation";
import { enableHistorySync, NuqsAdapter } from "nuqs/adapters/react";
import { Toaster } from "sonner";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import PostHogProvider from "../integrations/posthog/provider";
import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);root.setAttribute('data-theme',mode);root.style.colorScheme=resolved;}catch(e){}})();`;

if (typeof window !== "undefined") {
  enableHistorySync();
}

export const Route = createRootRoute({
  component: RootRoute,
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
    <main className="flex min-h-dvh items-center justify-center">
      <h2 className="text-2xl">{m["root.not_found"]()}</h2>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="flex min-h-dvh items-center justify-center">
      <div>
        <h2 className="text-2xl">{m["root.error_title"]()}</h2>
        <pre className="mt-4 rounded bg-destructive/10 p-4 text-destructive text-sm">
          {error.message}
        </pre>
      </div>
    </main>
  ),
});

const queryClient = new QueryClient();

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: theme state must be applied before hydration */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="wrap-anywhere font-sans antialiased">
        <QueryClientProvider client={queryClient}>
          <PostHogProvider>
            {children}
            <Toaster
              closeButton
              duration={4200}
              gap={8}
              mobileOffset={{
                bottom: "calc(var(--spacing) * 4 + env(safe-area-inset-bottom))",
                left: "calc(var(--spacing) * 4)",
                right: "calc(var(--spacing) * 4)",
              }}
              offset={{
                bottom: "calc(var(--spacing) * 4 + env(safe-area-inset-bottom))",
                right: "calc(var(--spacing) * 5)",
              }}
              position="bottom-right"
              toastOptions={{
                classNames: {
                  closeButton: "selfmail-sonner-close",
                  description: "selfmail-sonner-description",
                  error: "selfmail-sonner-error",
                  success: "selfmail-sonner-success",
                  toast: "selfmail-sonner-toast",
                },
                closeButtonAriaLabel: "Dismiss notification",
              }}
              visibleToasts={3}
            />
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
                {
                  name: "Tanstack Query",
                  render: <ReactQueryDevtoolsPanel />,
                },
              ]}
            />
          </PostHogProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}

function RootRoute() {
  return (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  );
}
