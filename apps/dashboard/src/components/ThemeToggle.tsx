import { useEffect, useState } from "react";
import {
	applyThemeMode,
	getStoredThemeMode,
	setStoredThemeMode,
	type ThemeMode,
} from "#/lib/theme";

export default function ThemeToggle() {
	const [mode, setMode] = useState<ThemeMode>("auto");

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
		const nextMode: ThemeMode =
			mode === "light" ? "dark" : mode === "dark" ? "auto" : "light";
		setMode(nextMode);
		setStoredThemeMode(nextMode);
	}

	const label =
		mode === "auto"
			? "Theme mode: auto (system). Click to switch to light mode."
			: `Theme mode: ${mode}. Click to switch mode.`;

	return (
		<button
			aria-label={label}
			className="rounded-full border border-border bg-background px-3 py-1.5 font-semibold text-foreground text-sm shadow-sm transition-colors hover:bg-muted"
			onClick={toggleMode}
			title={label}
			type="button"
		>
			{mode === "auto" ? "Auto" : mode === "dark" ? "Dark" : "Light"}
		</button>
	);
}
