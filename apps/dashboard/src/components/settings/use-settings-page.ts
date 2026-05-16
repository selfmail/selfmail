import { parseAsStringLiteral, useQueryState } from "nuqs";
import { settingsPageIds } from "./settings-pages";

export function useSettingsPage() {
	return useQueryState(
		"settings",
		parseAsStringLiteral(settingsPageIds).withOptions({
			history: "replace",
			scroll: false,
			shallow: true,
		}),
	);
}
