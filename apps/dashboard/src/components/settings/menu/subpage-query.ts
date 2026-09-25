import { parseAsString, useQueryStates } from "nuqs";

export function useSettingsSubpageQuery() {
	return useQueryStates(
		{ settings: parseAsString, "settings-item": parseAsString },
		{ history: "push" },
	);
}
