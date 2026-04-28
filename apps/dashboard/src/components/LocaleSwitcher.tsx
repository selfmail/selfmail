// Locale switcher refs:
// - Paraglide docs: https://inlang.com/m/gerre34r/library-inlang-paraglideJs
// - Router example: https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#switching-locale

import { m } from "#/paraglide/messages";
import { getLocale, locales, setLocale } from "#/paraglide/runtime";

export default function ParaglideLocaleSwitcher() {
	const currentLocale = getLocale();

	return (
		<div
			style={{
				display: "flex",
				gap: "0.5rem",
				alignItems: "center",
				color: "inherit",
			}}
		>
			<span style={{ opacity: 0.85 }}>
				{m.current_locale({ locale: currentLocale })}
			</span>
			<div style={{ display: "flex", gap: "0.25rem" }}>
				{locales.map((locale) => (
					<button
						aria-pressed={locale === currentLocale}
						key={locale}
						onClick={() => setLocale(locale)}
						style={{
							cursor: "pointer",
							padding: "0.35rem 0.75rem",
							borderRadius: "999px",
							border: "1px solid #d1d5db",
							background: locale === currentLocale ? "#0f172a" : "transparent",
							color: locale === currentLocale ? "#f8fafc" : "inherit",
							fontWeight: locale === currentLocale ? 700 : 500,
							letterSpacing: "0.01em",
						}}
						type="button"
					>
						{locale.toUpperCase()}
					</button>
				))}
			</div>
		</div>
	);
}
