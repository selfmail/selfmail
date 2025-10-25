import type { DocumentHead } from "@builder.io/qwik-city";

/**
 * Common head metadata for all dashboard pages
 */
export const dashboardHeadDefaults = {
	robots: "noindex, nofollow", // Private dashboard pages shouldn't be indexed
	ogType: "website",
	domain: "https://app.selfmail.com",
};

/**
 * Create a standardized DocumentHead for dashboard pages
 */
export function createDashboardHead({
	title,
	description,
	canonical,
	ogTitle,
	ogDescription,
}: {
	title: string;
	description: string;
	canonical?: string;
	ogTitle?: string;
	ogDescription?: string;
}): DocumentHead {
	return {
		title,
		meta: [
			{
				name: "description",
				content: description,
			},
			{
				property: "og:title",
				content: ogTitle || title,
			},
			{
				property: "og:description",
				content: ogDescription || description,
			},
			{
				property: "og:type",
				content: dashboardHeadDefaults.ogType,
			},
			{
				name: "robots",
				content: dashboardHeadDefaults.robots,
			},
		],
		links: canonical
			? [
					{
						rel: "canonical",
						href: canonical.startsWith("http")
							? canonical
							: `${dashboardHeadDefaults.domain}${canonical}`,
					},
				]
			: [],
	};
}

/**
 * Create head metadata for auth pages (publicly accessible)
 */
export function createAuthHead({
	title,
	description,
	canonical,
	ogTitle,
	ogDescription,
}: {
	title: string;
	description: string;
	canonical?: string;
	ogTitle?: string;
	ogDescription?: string;
}): DocumentHead {
	return {
		title,
		meta: [
			{
				name: "description",
				content: description,
			},
			{
				property: "og:title",
				content: ogTitle || title,
			},
			{
				property: "og:description",
				content: ogDescription || description,
			},
			{
				property: "og:type",
				content: "website",
			},
		],
		links: canonical
			? [
					{
						rel: "canonical",
						href: canonical.startsWith("http")
							? canonical
							: `${dashboardHeadDefaults.domain}${canonical}`,
					},
				]
			: [],
	};
}

/**
 * Dynamic head helper for workspace-specific pages
 */
export function createWorkspaceHead({
	title,
	description,
	workspaceSlug,
	path = "",
	emailCount,
}: {
	title: string;
	description: string;
	workspaceSlug: string;
	path?: string;
	emailCount?: number;
}) {
	const fullTitle = `${title} | ${workspaceSlug} | Selfmail`;
	const fullDescription =
		emailCount !== undefined
			? `${description} ${emailCount} email${emailCount !== 1 ? "s" : ""} in ${workspaceSlug} workspace on Selfmail.`
			: `${description} in ${workspaceSlug} workspace on Selfmail.`;

	return createDashboardHead({
		title: fullTitle,
		description: fullDescription,
		canonical: `/workspace/${workspaceSlug}${path}`,
	});
}
