import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleAlertIcon, LifeBuoyIcon } from "lucide-react";
import { z } from "zod";
import { verifyMagicLinkToken } from "#/lib/magic-link";
import { m } from "#/paraglide/messages";

const magicLinkSearchSchema = z.object({
	token: z
		.string()
		.trim()
		.optional()
		.transform((token) =>
			token && token.length >= 32 && token.length <= 64 ? token : undefined,
		),
});

export const Route = createFileRoute("/magic/")({
	component: RouteComponent,
	head: () => ({
		meta: [
			{ title: m["meta.magic_link.title"]() },
			{
				name: "description",
				content: m["meta.magic_link.description"](),
			},
		],
	}),
	validateSearch: magicLinkSearchSchema,
	loaderDeps: ({ search }) => ({
		token: search.token,
	}),
	loader: ({ deps }) => {
		const { token } = deps;
		if (!token) {
			return {
				error: {
					message: m["magic_link.errors.incomplete"](),
					requestId: crypto.randomUUID(),
				},
				status: "error" as const,
			};
		}

		return verifyMagicLinkToken({
			data: {
				token,
			},
		});
	},
});

function RouteComponent() {
	const result = Route.useLoaderData();

	if (result.status === "success") {
		return null;
	}

	return (
		<>
			<a
				className="absolute top-5 hidden font-medium text-xl sm:block"
				href="https://selfmail.app"
			>
				Selfmail
			</a>
			<div className="flex w-full flex-col gap-6 px-5 sm:px-10 md:w-[28rem] md:px-0">
				<div className="flex items-center justify-center">
					<div className="flex size-14 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
						<CircleAlertIcon className="size-6" />
					</div>
				</div>
				<div className="space-y-2 text-center">
					<h1 className="text-balance font-medium text-3xl">
						{m["magic_link.page.title"]()}
					</h1>
					<p className="text-pretty text-neutral-700 text-sm">
						{result.error.message}
					</p>
				</div>
				<div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-700 text-sm">
					{m["magic_link.page.request_id"]()}{" "}
					<span className="font-mono text-[13px]">
						{result.error.requestId}
					</span>
				</div>
				<div className="flex flex-col gap-3">
					<Link
						className="w-full rounded-full bg-neutral-900 px-6 py-3 text-center text-white transition-colors duration-200 hover:bg-neutral-700"
						to="/login"
					>
						{m["magic_link.page.back_to_login"]()}
					</Link>
					<Link
						className="flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-6 py-3 text-center text-neutral-900 transition-colors duration-200 hover:bg-neutral-100"
						to="/contact"
					>
						<LifeBuoyIcon className="size-4" />
						{m["magic_link.page.contact_support"]()}
					</Link>
				</div>
			</div>
		</>
	);
}
