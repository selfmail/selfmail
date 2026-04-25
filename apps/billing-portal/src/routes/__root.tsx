import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Agentation } from "agentation";
import Footer from "#/components/Footer";
import LanguageSelect from "#/components/LocaleSwitcher";
import { getLocale } from "#/paraglide/runtime";
import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRoute({
  loader: () => ({
    locale: getLocale(),
  }),
  beforeLoad: () => {
    // Other redirect strategies are possible; see
    // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", getLocale());
    }
  },
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
        title: "TanStack Start Starter",
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
  errorComponent: () => {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="font-bold text-2xl">An unexpected error occurred.</h1>
      </div>
    );
  },
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { locale } = Route.useLoaderData();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: required for theme bootstrapping before hydration */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="wrap-anywhere relative min-h-dvh w-full bg-white font-sans text-neutral-900 antialiased dark:bg-neutral-900 dark:text-neutral-100">
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
        <DevAgentation />
      </body>
    </html>
  );
}

function DevAgentation() {
  if (process.env.NODE_ENV !== "development" || typeof document === "undefined") {
    return null;
  }

  return <Agentation />;
}
