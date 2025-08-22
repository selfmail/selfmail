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

	export const addressParamsSchema = t.Object({
		addressId: t.String({
			description: "The address ID to get emails for",
		}),
	});
	export type AddressParams = typeof addressParamsSchema.static;

	export const emailsQuerySchema = t.Object({
		page: t.Optional(t.Numeric({ default: 1, minimum: 1 })),
		limit: t.Optional(t.Numeric({ default: 20, minimum: 1, maximum: 100 })),
		search: t.Optional(
			t.String({ description: "Search term for filtering emails" }),
		),
		workspaceId: t.String({
			description: "The workspace ID to filter emails by",
		}),
		addressId: t.String({
			format: "uuid",
			description: "The address ID to filter emails by",
		}),
	});
	export type EmailsQuery = typeof emailsQuerySchema.static;
}
