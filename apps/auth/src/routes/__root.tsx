import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Agentation } from "agentation";
import Footer from "#/components/Footer";
import LanguageSelect from "#/components/LanguageSelect";
import { TooltipProvider } from "#/components/ui/tooltip.js";
import { m } from "#/paraglide/messages";
import { getLocale } from "../paraglide/runtime.js";
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
        title: m["meta.not_found.title"](),
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});
const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 px-5 text-center sm:px-0">
      <h1 className="font-medium text-2xl">{m["not_found.title"]()}</h1>
      <p className="text-neutral-700 text-sm">{m["not_found.description"]()}</p>
      <a
        className="rounded-full bg-neutral-900 px-6 py-3 text-white transition-colors duration-200 hover:bg-neutral-700"
        href="/login"
      >
        {m["not_found.cta"]()}
      </a>
    </div>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint: need this in order for the themes to work  */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <QueryClientProvider client={queryClient}>
        <body className="wrap-anywhere relative min-h-dvh w-full bg-white font-sans text-neutral-900 antialiased dark:bg-neutral-900 dark:text-neutral-100">
          <TooltipProvider>
            <div className="relative flex min-h-dvh w-full flex-col">
              <div className="absolute inset-x-0 top-4 z-10 flex items-center justify-between px-4 sm:hidden">
                <a className="font-medium text-sm" href="https://selfmail.app">
                  Selfmail
                </a>
                <LanguageSelect />
              </div>
              <div className="absolute top-4 left-4 z-10 hidden sm:block">
                <LanguageSelect />
              </div>
              <main className="flex flex-1 items-start justify-center px-0 pt-20 pb-8 sm:pt-24">
                {children}
              </main>
              <Footer />
            </div>
          </TooltipProvider>
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
          <Scripts />
          <Agentation />
        </body>
      </QueryClientProvider>
    </html>
  );
}
