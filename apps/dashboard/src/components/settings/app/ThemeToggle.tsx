import { useEffect, useSyncExternalStore } from "react";
import {
	applyThemeMode,
	getStoredThemeMode,
	setStoredThemeMode,
	type ThemeMode,
	themeStorageKey,
} from "#/lib/theme";
import { m } from "#/paraglide/messages";

const themeModeChangeEvent = "selfmail:theme-mode-change";

function getServerThemeMode(): ThemeMode {
	return "auto";
}

function subscribeToThemeMode(onStoreChange: () => void) {
	const onStorage = (event: StorageEvent) => {
		if (event.key === themeStorageKey) {
			onStoreChange();
		}
	};

	window.addEventListener("storage", onStorage);
	window.addEventListener(themeModeChangeEvent, onStoreChange);

	return () => {
		window.removeEventListener("storage", onStorage);
		window.removeEventListener(themeModeChangeEvent, onStoreChange);
	};
}

export default function ThemeToggle() {
	const mode = useSyncExternalStore(
		subscribeToThemeMode,
		getStoredThemeMode,
		getServerThemeMode,
	);
	let buttonLabel = m["dashboard.settings.app.theme.light"]();

	if (mode === "auto") {
		buttonLabel = m["dashboard.settings.app.theme.auto"]();
	} else if (mode === "dark") {
		buttonLabel = m["dashboard.settings.app.theme.dark"]();
	}

	useEffect(() => {
		applyThemeMode(mode);
	}, [mode]);

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

		setStoredThemeMode(nextMode);
		window.dispatchEvent(new Event(themeModeChangeEvent));
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
