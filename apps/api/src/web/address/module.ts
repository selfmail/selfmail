import { t } from "elysia";

export namespace AddressModule {
	export const createAddressBody = t.Object({
		email: t.String({
			format: "email",
			description: "The email address to create",
		}),
		domain: t.String({
			minLength: 2,
			maxLength: 100,
			description: "The domain for the email address",
		}),
	});
	export type CreateAddressBody = typeof createAddressBody.static;

	export const deleteAddressBody = t.Object({
		id: t.String({
			description: "The address ID to delete",
		}),
	});
	export type DeleteAddressBody = typeof deleteAddressBody.static;
}
