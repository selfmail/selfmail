import { t } from "elysia";

export namespace DashboardModule {
	export const multipleEmailsQuery = t.Object({
		page: t.Optional(t.Numeric({ default: 1, minimum: 1 })),
		limit: t.Optional(t.Numeric({ default: 20, minimum: 1, maximum: 100 })),
	});

	export type EmailsQuery = typeof multipleEmailsQuery.static;

	export const singleEmailParams = t.Object({
		id: t.String(),
	});

	export type SingleEmailParams = typeof singleEmailParams.static;
}
