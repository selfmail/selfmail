import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	setLocale: vi.fn(),
}));

vi.mock("#/paraglide/messages", () => ({
	m: {
		language_select_label: () => "Select language",
	},
}));

vi.mock("#/paraglide/runtime.js", () => ({
	getLocale: () => "en",
	locales: ["en", "de", "es", "fr"],
	setLocale: mocks.setLocale,
}));

import LanguageSelect from "./LanguageSelect";

describe("LanguageSelect", () => {
	it("renders through the shared UI select during SSR", () => {
		const markup = renderToStaticMarkup(<LanguageSelect />);

		expect(markup).toContain('aria-label="Select language"');
		expect(markup).toContain("English");
	});
});
