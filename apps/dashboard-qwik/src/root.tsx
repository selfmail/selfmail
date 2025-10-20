import { component$, isDev, useServerData, useVisibleTask$ } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { Toaster } from "qwik-sonner";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";
import posthog from "posthog-js";

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */
  useVisibleTask$(async () => {
    let apiHost = "https://eu.i.posthog.com";
    try {
      await fetch(apiHost, { method: "HEAD", mode: 'no-cors' });
    } catch (err) {
      apiHost = "https://a.selfmail.app";
    }
    posthog.init(import.meta.env.PUBLIC_POSTHOG_KEY, {
      api_host: apiHost,
      person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
    });
  })
  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}
        <RouterHead />
      </head>
      <body lang="en">
        <Toaster />
        <RouterOutlet />
      </body>
    </QwikCityProvider >
  );
});
