export const themeStorageKey = "theme";
export const themeModes = ["auto", "light", "dark"] as const;

export type ThemeMode = (typeof themeModes)[number];

export function isThemeMode(value: string | null): value is ThemeMode {
	return themeModes.some((mode) => mode === value);
}

export function getStoredThemeMode(): ThemeMode {
	if (typeof window === "undefined") {
		return "auto";
	}

	const stored = window.localStorage.getItem(themeStorageKey);
	return isThemeMode(stored) ? stored : "auto";
}

export function resolveThemeMode(mode: ThemeMode): Exclude<ThemeMode, "auto"> {
	if (mode !== "auto") {
		return mode;
	}

	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export function applyThemeMode(mode: ThemeMode) {
	if (typeof document === "undefined") {
		return;
	}

	const resolved = resolveThemeMode(mode);
	const root = document.documentElement;

	root.classList.remove("light", "dark");
	root.classList.add(resolved);
	root.dataset.theme = mode;
	root.style.colorScheme = resolved;
}

export function setStoredThemeMode(mode: ThemeMode) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(themeStorageKey, mode);
	applyThemeMode(mode);
}
