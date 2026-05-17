import { cn } from "#/components/ui";
import { m } from "#/paraglide/messages";
import { getLocale, locales, setLocale } from "#/paraglide/runtime";

export default function ParaglideLocaleSwitcher() {
	const currentLocale = getLocale();

	return (
		<div className="flex items-center gap-2 text-inherit">
			<span className="opacity-80">
				{m.current_locale({ locale: currentLocale })}
			</span>
			<div className="flex gap-1">
				{locales.map((locale) => (
					<button
						aria-pressed={locale === currentLocale}
						className={cn(
							"cursor-pointer rounded-full border border-border px-3 py-1.5 font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
							locale === currentLocale &&
								"bg-primary font-bold text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
						)}
						key={locale}
						onClick={() => setLocale(locale)}
						type="button"
					>
						{locale.toUpperCase()}
					</button>
				))}
			</div>
		</div>
	);
}
