import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { m } from "#/paraglide/messages";
import { getLocale, locales, setLocale } from "#/paraglide/runtime.js";

const LANGUAGE_LABELS: Record<(typeof locales)[number], string> = {
  de: "Deutsch",
  en: "English",
  es: "Español",
  fr: "Français",
};

export default function LanguageSelect() {
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
          aria-label={m.language_select_label()}
          className="h-8 min-w-24 rounded-full border-2 border-input bg-transparent px-3 py-1 text-xs outline-none ring-ring/50 transition-colors duration-200 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 data-[size=default]:h-8 data-[size=sm]:h-8 data-placeholder:text-muted-foreground"
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
          className="rounded-3xl border-2 border-border bg-popover p-1 text-popover-foreground shadow-none"
        >
          {locales.map((locale) => (
            <SelectItem
              className="cursor-pointer rounded-full px-3 py-1.5 text-xs focus:bg-accent focus:text-accent-foreground"
              key={locale}
              value={locale}
            >
              {LANGUAGE_LABELS[locale]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
