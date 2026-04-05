import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { getLocale, locales, setLocale } from "#/paraglide/runtime";

const LANGUAGE_LABELS: Record<(typeof locales)[number], string> = {
  de: "Deutsch",
  en: "English",
  es: "Español",
  fr: "Français",
};

export default function LocaleSwitcher() {
  const currentLocale = getLocale();

  return (
    <div className="opacity-45 transition-opacity duration-200 focus-within:opacity-100 hover:opacity-100">
      <Select
        defaultValue={currentLocale}
        onValueChange={async (locale) => {
          if (locale === currentLocale) {
            return;
          }

          await setLocale(locale as (typeof locales)[number]);
        }}
      >
        <SelectTrigger
          aria-label="Select language"
          className="h-8 min-w-24 rounded-full border-2 border-neutral-200 bg-transparent px-3 py-1 text-xs outline-none ring-neutral-200 transition-colors duration-200 focus-visible:border-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 data-[size=default]:h-8 data-[size=sm]:h-8 data-placeholder:text-neutral-500"
          size="sm"
        >
          <SelectValue>
            {(value) => {
              if (!value || typeof value !== "string") {
                return LANGUAGE_LABELS[currentLocale];
              }

              return (
                LANGUAGE_LABELS[value as (typeof locales)[number]] ?? value
              );
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          align="start"
          className="rounded-3xl border-2 border-neutral-200 bg-white p-1 shadow-none"
        >
          {locales.map((locale) => (
            <SelectItem
              className="cursor-pointer rounded-full px-3 py-1.5 text-xs focus:bg-neutral-100 focus:text-neutral-900"
              key={locale}
              value={locale}
            >
              {LANGUAGE_LABELS[locale] ?? locale}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
