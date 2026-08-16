import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@selfmail/ui";
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
				onValueChange={(locale) => {
					if (locale === currentLocale) {
						return;
					}

					setLocale(locale);
				}}
			>
				<SelectTrigger
					aria-label={m.language_select_label()}
					className="h-8 w-fit min-w-24 px-3 py-1 text-xs"
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent align="start">
					{locales.map((locale) => (
						<SelectItem key={locale} value={locale}>
							{LANGUAGE_LABELS[locale]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
