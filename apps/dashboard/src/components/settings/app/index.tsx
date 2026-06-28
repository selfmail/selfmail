import { useEffect, useState } from "react";
import {
  SettingsGroup,
  SettingsSelect,
  type SettingsSelectOption,
} from "#/components/ui";
import {
  applyThemeMode,
  getStoredThemeMode,
  setStoredThemeMode,
  type ThemeMode,
  themeModes,
} from "#/lib/theme";
import { m } from "#/paraglide/messages";
import {
  cookieDomain,
  cookieName,
  locales,
  setLocale,
} from "#/paraglide/runtime";

const languageValues = ["auto", "fr", "en", "es", "de"] as const;

type Locale = (typeof locales)[number];
type AppLanguageValue = (typeof languageValues)[number];

const languageLabels = {
  auto: m["dashboard.settings.app.language.auto"],
  de: m["dashboard.settings.app.language.de"],
  en: m["dashboard.settings.app.language.en"],
  es: m["dashboard.settings.app.language.es"],
  fr: m["dashboard.settings.app.language.fr"],
} satisfies Record<AppLanguageValue, () => string>;

const themeLabels = {
  auto: m["dashboard.settings.app.theme.auto"],
  dark: m["dashboard.settings.app.theme.dark"],
  light: m["dashboard.settings.app.theme.light"],
} satisfies Record<ThemeMode, () => string>;

function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value);
}

function getCookieLocale(): AppLanguageValue {
  if (typeof document === "undefined") {
    return "auto";
  }

  const match = document.cookie.match(new RegExp(`(^| )${cookieName}=([^;]+)`));
  const locale = match?.[2];

  return locale && languageValues.some((value) => value === locale)
    ? (locale as AppLanguageValue)
    : "auto";
}

function clearLocaleCookie() {
  if (typeof document === "undefined") {
    return;
  }

  const cookie = `${cookieName}=; path=/; max-age=0`;
  // biome-ignore lint/suspicious/noDocumentCookie: Paraglide stores the manual locale in this configured cookie.
  document.cookie = cookieDomain ? `${cookie}; domain=${cookieDomain}` : cookie;
}

export function AppSettingsPage() {
  const [languageValue, setLanguageValue] =
    useState<AppLanguageValue>(getCookieLocale);
  const [themeValue, setThemeValue] = useState<ThemeMode>(getStoredThemeMode);
  const languageOptions: SettingsSelectOption[] = languageValues.map(
    (value) => ({
      label: languageLabels[value](),
      value,
    })
  );
  const themeOptions: SettingsSelectOption[] = themeModes.map((value) => ({
    label: themeLabels[value](),
    value,
  }));

  useEffect(() => {
    if (themeValue !== "auto") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyThemeMode("auto");

    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
    };
  }, [themeValue]);

  const handleLanguageChange = (value: unknown) => {
    if (typeof value !== "string") {
      return;
    }

    if (value === "auto") {
      setLanguageValue("auto");
      clearLocaleCookie();
      window.location.reload();
      return;
    }

    if (isLocale(value)) {
      setLanguageValue(value);
      setLocale(value);
    }
  };

  const handleThemeChange = (value: unknown) => {
    if (typeof value !== "string") {
      return;
    }

    if (!(value === "auto" || value === "light" || value === "dark")) {
      return;
    }

    setThemeValue(value);
    setStoredThemeMode(value);
  };

  return (
    <SettingsGroup>
      <SettingsSelect
        contentClassName="w-full"
        description={m["dashboard.settings.app.theme.description"]()}
        onValueChange={handleThemeChange}
        options={themeOptions}
        title={m["dashboard.settings.app.theme.title"]()}
        value={themeValue}
      />
      <SettingsSelect
        contentClassName="w-full"
        description={m["dashboard.settings.app.language.description"]()}
        onValueChange={handleLanguageChange}
        options={languageOptions}
        title={m["dashboard.settings.app.language.title"]()}
        value={languageValue}
      />
    </SettingsGroup>
  );
}
