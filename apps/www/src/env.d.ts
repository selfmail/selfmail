/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly PUBLIC_DASHBOARD_URL?: string;
  readonly PUBLIC_AUTH_URL?: string;
  readonly PUBLIC_DOCS_URL?: string;
  readonly PUBLIC_POSTHOG_KEY?: string;
  readonly PUBLIC_POSTHOG_HOST?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
