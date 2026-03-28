import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	CircleAlertIcon,
	CircleCheckBigIcon,
	LifeBuoyIcon,
} from "lucide-react";
import { z } from "zod";
import {
	clearTempSessionCookie,
	createSession,
	getAppRedirectUrl,
	getTempSessionCookie,
	hashToken,
} from "#/lib/session";
import { m } from "#/paraglide/messages";

const logger = createLogger("auth-verify-email");

const verifySearchSchema = z.object({
	token: z
		.string()
		.trim()
		.optional()
		.transform((token) =>
			token && token.length >= 32 && token.length <= 64 ? token : undefined,
		),
});

type VerifyResult =
	| {
			status: "error";
			error: {
				message: string;
				requestId: string;
			};
	  }
	| {
			status: "login_required";
			message: string;
	  }
	| {
			status: "success";
	  };

const createRequestId = () => crypto.randomUUID();

const verifyEmailToken = async (token: string): Promise<VerifyResult> => {
	const requestId = createRequestId();

	try {
		const emailVerification = await db.emailVerification.findUnique({
			include: {
				user: true,
			},
			where: {
				token,
			},
		});

		if (!emailVerification) {
			return {
				status: "error",
				error: {
					message: m["verify.errors.invalid"](),
					requestId,
				},
			};
		}

		if (emailVerification.expiresAt < new Date()) {
			await db.emailVerification.delete({
				where: {
					id: emailVerification.id,
				},
			});
			clearTempSessionCookie();

			return {
				status: "error",
				error: {
					message: m["verify.errors.expired"](),
					requestId,
				},
			};
		}

		const tempSessionToken = getTempSessionCookie();
		const tempSessionHash = tempSessionToken
			? await hashToken(tempSessionToken)
			: undefined;
		const sameBrowser =
			!!tempSessionHash &&
			!!emailVerification.browserTokenHash &&
			tempSessionHash === emailVerification.browserTokenHash;

		await db.$transaction(async (tx) => {
			if (!emailVerification.user.emailVerified) {
				await tx.user.update({
					data: {
						emailVerified: new Date(),
					},
					where: {
						id: emailVerification.userId,
					},
				});
			}

			await tx.emailVerification.delete({
				where: {
					id: emailVerification.id,
				},
			});
		});

		clearTempSessionCookie();

		if (!sameBrowser) {
			return {
				status: "login_required",
				message: m["verify.success.description"](),
			};
		}

		await createSession(emailVerification.userId);

		throw redirect({
			href: getAppRedirectUrl(),
			statusCode: 302,
		});
	} catch (error) {
		if (error instanceof Response) {
			throw error;
		}

		logger.error(
			"Email verification failed unexpectedly",
			error instanceof Error ? error : undefined,
			{ requestId, token },
		);

		return {
			status: "error",
			error: {
				message: m["verify.errors.unknown"](),
				requestId,
			},
		};
	}
};

export const Route = createFileRoute("/verify/")({
	component: RouteComponent,
	head: () => ({
		meta: [
			{ title: m["meta.verify.title"]() },
			{
				name: "description",
				content: m["meta.verify.description"](),
			},
		],
	}),
	validateSearch: verifySearchSchema,
	loaderDeps: ({ search }) => ({
		token: search.token,
	}),
	loader: ({ deps }) => {
		if (!deps.token) {
			return {
				status: "error" as const,
				error: {
					message: m["verify.errors.incomplete"](),
					requestId: crypto.randomUUID(),
				},
			};
		}

		return verifyEmailToken(deps.token);
	},
});

function RouteComponent() {
	const result = Route.useLoaderData();

	if (result.status === "success") {
		return null;
	}

	const isSuccess = result.status === "login_required";

	return (
		<>
			<a
				className="absolute top-5 hidden font-medium text-xl sm:block"
				href="https://selfmail.app"
			>
				Selfmail
			</a>
			<div className="flex w-full flex-col gap-6 px-5 sm:px-10 md:w-md md:px-0">
				<div className="flex items-center justify-center">
					<div
						className={
							isSuccess
								? "flex size-14 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-600"
								: "flex size-14 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600"
						}
					>
						{isSuccess ? (
							<CircleCheckBigIcon className="size-6" />
						) : (
							<CircleAlertIcon className="size-6" />
						)}
					</div>
				</div>
				<div className="space-y-2 text-center">
					<h1 className="text-balance font-medium text-3xl">
						{isSuccess
							? m["verify.success.title"]()
							: m["verify.error.title"]()}
					</h1>
					<p className="text-pretty text-neutral-700 text-sm">
						{isSuccess ? result.message : result.error.message}
					</p>
				</div>
				{result.status === "error" ? (
					<div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-700 text-sm">
						{m["verify.error.request_id"]()}{" "}
						<span className="font-mono text-[13px]">
							{result.error.requestId}
						</span>
					</div>
				) : null}
				<div className="flex flex-col gap-3">
					<Link
						className="w-full rounded-full bg-neutral-900 px-6 py-3 text-center text-white transition-colors duration-200 hover:bg-neutral-700"
						to="/login"
					>
						{isSuccess
							? m["verify.success.continue_to_login"]()
							: m["verify.error.back_to_login"]()}
					</Link>
					<Link
						className="flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-6 py-3 text-center text-neutral-900 transition-colors duration-200 hover:bg-neutral-100"
						to="/contact"
					>
						<LifeBuoyIcon className="size-4" />
						{m["verify.contact_support"]()}
					</Link>
				</div>
			</div>
		</>
	);
}
