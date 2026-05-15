import { parseAsString, useQueryState } from "nuqs";

export function useViewedEmail() {
	const [emailId, setEmailId] = useQueryState(
		"email",
		parseAsString.withOptions({
			history: "replace",
			scroll: false,
			shallow: true,
		}),
	);

	return {
		closePreview: () => setEmailId(null),
		emailId: emailId ?? undefined,
		setEmailId,
	};
}
