import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CircleAlertIcon, LifeBuoyIcon, ShieldCheckIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import { z } from "zod";
import {
	type VerifyMagicLinkResult,
	verifyMagicLinkToken,
} from "#/libs/magic-link";
import { m } from "#/paraglide/messages";

const magicLinkSearchSchema = z.object({
	redirect: z
		.string()
		.optional()
		.transform((redirect) =>
			redirect?.startsWith("/") && !redirect.startsWith("//")
				? redirect
				: undefined,
		),
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
});

function RouteComponent() {
	const { redirect, token } = Route.useSearch();
	const verifyMagicLink = useServerFn(verifyMagicLinkToken);
	const [result, setResult] = useState<VerifyMagicLinkResult | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [incompleteRequestId] = useState(() => crypto.randomUUID());
	const initialError: VerifyMagicLinkResult | null = token
		? null
		: {
				error: {
					message: m["magic_link.errors.incomplete"](),
					requestId: incompleteRequestId,
				},
				status: "error",
			};
	const visibleResult = result ?? initialError;

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!token) {
			return;
		}

		setResult(null);
		setIsSubmitting(true);

		try {
			const verificationResult = await verifyMagicLink({
				data: {
					redirect,
					token,
				},
			});

			setResult(verificationResult);
		} catch {
			setResult({
				error: {
					message: m["magic_link.errors.unknown"](),
					requestId: crypto.randomUUID(),
				},
				status: "error",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (visibleResult?.status === "success") {
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
			<div className="flex w-full flex-col gap-6 px-5 sm:px-10 md:w-md md:px-0">
				{visibleResult ? (
					<>
						<div className="flex items-center justify-center">
							<div className="flex size-14 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
								<CircleAlertIcon className="size-6" />
							</div>
						</div>
						<div className="space-y-2 text-center">
							<h1 className="text-balance font-medium text-3xl">
								{m["magic_link.page.title"]()}
							</h1>
							<p
								aria-live="polite"
								className="text-pretty text-neutral-700 text-sm"
								role="alert"
							>
								{visibleResult.error.message}
							</p>
						</div>
						<div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-700 text-sm">
							{m["magic_link.page.request_id"]()}{" "}
							<span className="font-mono text-[13px]">
								{visibleResult.error.requestId}
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
					</>
				) : (
					<>
						<div className="flex items-center justify-center">
							<div className="flex size-14 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-900">
								<ShieldCheckIcon className="size-6" />
							</div>
						</div>
						<div className="space-y-2 text-center">
							<h1 className="text-balance font-medium text-3xl">
								{m["magic_link.ready.title"]()}
							</h1>
							<p className="text-pretty text-neutral-700 text-sm">
								{m["magic_link.ready.description"]()}
							</p>
						</div>
						<form className="flex flex-col gap-3" onSubmit={handleSubmit}>
							<button
								className="hit-area-2 w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 text-white transition-colors duration-200 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 hover:bg-neutral-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
								disabled={isSubmitting}
								type="submit"
							>
								{isSubmitting
									? m["magic_link.ready.submitting"]()
									: m["magic_link.ready.submit"]()}
							</button>
							<Link
								className="w-full rounded-full border border-neutral-200 px-6 py-3 text-center text-neutral-900 transition-colors duration-200 hover:bg-neutral-100"
								to="/login"
							>
								{m["magic_link.page.back_to_login"]()}
							</Link>
						</form>
					</>
				)}
			</div>
		</>
	);
}
