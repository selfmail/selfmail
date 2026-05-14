import { addressSlugAlphabet } from "./constants";

export function createAddressSlug() {
	return Array.from({ length: 5 }, () =>
		addressSlugAlphabet.charAt(
			Math.floor(Math.random() * addressSlugAlphabet.length),
		),
	).join("");
}
