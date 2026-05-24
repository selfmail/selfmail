import { useEffect, useState } from "react";
import {
	applyThemeMode,
	getStoredThemeMode,
	setStoredThemeMode,
	type ThemeMode,
} from "#/lib/theme";
import { m } from "#/paraglide/messages";

export default function ThemeToggle() {
	const [mode, setMode] = useState<ThemeMode>("auto");
	let buttonLabel = m["dashboard.settings.app.theme.light"]();

	if (mode === "auto") {
		buttonLabel = m["dashboard.settings.app.theme.auto"]();
	} else if (mode === "dark") {
		buttonLabel = m["dashboard.settings.app.theme.dark"]();
	}

	useEffect(() => {
		const initialMode = getStoredThemeMode();
		setMode(initialMode);
		applyThemeMode(initialMode);
	}, []);

	useEffect(() => {
		if (mode !== "auto") {
			return;
		}

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyThemeMode("auto");

		media.addEventListener("change", onChange);
		return () => {
			media.removeEventListener("change", onChange);
		};
	}, [mode]);

	function toggleMode() {
		let nextMode: ThemeMode;
		if (mode === "light") {
			nextMode = "dark";
		} else if (mode === "dark") {
			nextMode = "auto";
		} else {
			nextMode = "light";
		}

		setMode(nextMode);
		setStoredThemeMode(nextMode);
	}

	const label =
		mode === "auto"
			? m["dashboard.settings.app.theme.toggle_auto_label"]()
			: m["dashboard.settings.app.theme.toggle_mode_label"]({ mode });

	return (
		<button
			aria-label={label}
			className="rounded-full border border-border bg-background px-3 py-1.5 font-semibold text-foreground text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
			onClick={toggleMode}
			title={label}
			type="button"
		>
			{buttonLabel}
		</button>
	);
}
