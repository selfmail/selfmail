import { t } from "elysia";

export namespace SMTPModule {
	export const smtpCredentialsBody = t.Object({
		addressId: t.String({
			format: "uuid",
			description: "The address ID that these credentials will be linked to",
		}),
		title: t.String({
			minLength: 1,
			maxLength: 100,
			description: "A descriptive title for these credentials",
		}),
		description: t.Optional(
			t.String({
				maxLength: 500,
				description: "Optional description for these credentials",
			}),
		),
		activeUntil: t.Optional(
			t.Date({
				description: "Optional expiration date for these credentials",
			}),
		),
	});
	export type SmtpCredentialsBody = typeof smtpCredentialsBody.static;

	export const updateSmtpCredentialsBody = t.Object({
		title: t.Optional(
			t.String({
				minLength: 1,
				maxLength: 100,
				description: "A descriptive title for these credentials",
			}),
		),
		description: t.Optional(
			t.String({
				maxLength: 500,
				description: "Optional description for these credentials",
			}),
		),
		activeUntil: t.Optional(
			t.Date({
				description: "Optional expiration date for these credentials",
			}),
		),
	});
	export type UpdateSmtpCredentialsBody =
		typeof updateSmtpCredentialsBody.static;

	export const credentialsParams = t.Object({
		credentialsId: t.String({
			format: "uuid",
			description: "The ID of the SMTP credentials",
		}),
	});
	export type CredentialsParams = typeof credentialsParams.static;

	export const credentialsQuery = t.Object({
		page: t.Optional(
			t.Numeric({
				minimum: 1,
				description: "Page number for pagination",
			}),
		),
		limit: t.Optional(
			t.Numeric({
				minimum: 1,
				maximum: 100,
				description: "Number of items per page",
			}),
		),
		addressId: t.Optional(
			t.String({
				format: "uuid",
				description: "Filter by address ID",
			}),
		),
	});
	export type CredentialsQuery = typeof credentialsQuery.static;
}
