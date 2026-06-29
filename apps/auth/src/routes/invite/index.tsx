import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	Building2Icon,
	CheckIcon,
	CircleAlertIcon,
	MailIcon,
	XIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
	acceptInviteFn,
	declineInviteFn,
	getInviteFn,
	type InviteLookupResult,
} from "#/libs/invite";
import { getAppRedirectUrlFn } from "#/libs/session";

const pendingInviteTokenKey = "selfmail.pendingInviteToken";

const inviteSearchSchema = z.object({
	token: z
		.string()
		.trim()
		.optional()
		.transform((token) => (token ? token.slice(0, 256) : undefined)),
});

type InviteAction = "accept" | "decline";
type InviteActionState = "declined" | "idle";

export const Route = createFileRoute("/invite/")({
	component: RouteComponent,
	head: () => ({
		meta: [
			{
				title: "Workspace invite",
			},
		],
	}),
	validateSearch: inviteSearchSchema,
	loaderDeps: ({ search }) => ({
		token: search.token,
	}),
	loader: async ({ deps }) => ({
		dashboardUrl: await getAppRedirectUrlFn(),
		result: deps.token
			? await getInviteFn({
					data: {
						token: deps.token,
					},
				})
			: null,
	}),
});

function RouteComponent() {
	const { token } = Route.useSearch();
	const { dashboardUrl, result } = Route.useLoaderData();
	const navigate = useNavigate();
	const [actionState, setActionState] = useState<InviteActionState>("idle");
	const [actionError, setActionError] = useState<string | null>(null);
	const [submittingAction, setSubmittingAction] = useState<InviteAction | null>(
		null,
	);
	const inviteRedirect = useMemo(
		() => (token ? `/invite?token=${encodeURIComponent(token)}` : "/invite"),
		[token],
	);

	useEffect(() => {
		if (token) {
			sessionStorage.setItem(pendingInviteTokenKey, token);
			return;
		}

		const storedToken = sessionStorage.getItem(pendingInviteTokenKey);

		if (storedToken) {
			void navigate({
				replace: true,
				search: {
					token: storedToken,
				},
				to: "/invite",
			});
		}
	}, [navigate, token]);

	const handleInviteAction = async (action: InviteAction) => {
		if (!token) {
			setActionError("This invite link is missing a token.");
			return;
		}

		setActionError(null);
		setSubmittingAction(action);

		try {
			const actionResult =
				action === "accept"
					? await acceptInviteFn({
							data: {
								token,
							},
						})
					: await declineInviteFn({
							data: {
								token,
							},
						});

			if (actionResult.status === "unauthenticated") {
				await navigate({
					search: {
						redirect: inviteRedirect,
					},
					to: "/login",
				});
				return;
			}

			if (actionResult.status === "error") {
				setActionError(actionResult.error);
				return;
			}

			sessionStorage.removeItem(pendingInviteTokenKey);

			if (action === "decline") {
				setActionState("declined");
				return;
			}

			window.location.href = `${dashboardUrl.replace(/\/$/, "")}/${
				actionResult.workspaceSlug
			}`;
		} finally {
			setSubmittingAction(null);
		}
	};

	if (!token && !result) {
		return (
			<InviteShell
				description="Open the invitation link from your email, or sign in and we will continue if an invitation is saved in this browser."
				icon={<MailIcon className="size-6" />}
				title="No invite selected"
			>
				<div className="flex flex-col gap-3">
					<Link className={primaryButtonClassName} to="/login">
						Sign in
					</Link>
					<Link className={secondaryButtonClassName} to="/register">
						Create account
					</Link>
				</div>
			</InviteShell>
		);
	}

	if (actionState === "declined") {
		return (
			<InviteShell
				description="You declined this workspace invitation. You can close this page."
				icon={<XIcon className="size-6" />}
				title="Invitation declined"
			/>
		);
	}

	if (!result || result.status === "unauthenticated") {
		return (
			<InviteShell
				description="Sign in or create an account to review this workspace invitation."
				icon={<MailIcon className="size-6" />}
				title="Workspace invite"
			>
				<div className="flex flex-col gap-3">
					<Link
						className={primaryButtonClassName}
						search={{
							redirect: inviteRedirect,
						}}
						to="/login"
					>
						Sign in
					</Link>
					<Link
						className={secondaryButtonClassName}
						search={{
							redirect: inviteRedirect,
						}}
						to="/register"
					>
						Create account
					</Link>
				</div>
			</InviteShell>
		);
	}

	if (result.status === "error") {
		return (
			<InviteShell
				description={result.error}
				icon={<CircleAlertIcon className="size-6" />}
				title="Invite unavailable"
			>
				<Link className={secondaryButtonClassName} to="/login">
					Switch account
				</Link>
			</InviteShell>
		);
	}

	return (
		<AuthenticatedInvite
			actionError={actionError}
			onAccept={() => handleInviteAction("accept")}
			onDecline={() => handleInviteAction("decline")}
			result={result}
			submittingAction={submittingAction}
		/>
	);
}

function AuthenticatedInvite({
	actionError,
	onAccept,
	onDecline,
	result,
	submittingAction,
}: {
	actionError: string | null;
	onAccept: () => void;
	onDecline: () => void;
	result: Extract<InviteLookupResult, { status: "success" }>;
	submittingAction: InviteAction | null;
}) {
	const { invite, user } = result;
	const isAnswered = invite.status !== "PENDING";

	return (
		<InviteShell
			description={`${invite.invitedBy.name} invited ${invite.email} to join this workspace.`}
			icon={<Building2Icon className="size-6" />}
			title={invite.workspace.name}
		>
			<div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
				<div className="grid gap-2">
					<InviteMetaRow label="Signed in as" value={user.email} />
					<InviteMetaRow
						label="Role"
						value={invite.roleName ?? "Workspace member"}
					/>
					{invite.workspace.description ? (
						<InviteMetaRow
							label="Workspace"
							value={invite.workspace.description}
						/>
					) : null}
				</div>
			</div>

			{isAnswered ? (
				<output
					aria-live="polite"
					className="text-center text-neutral-700 text-sm"
				>
					This invitation is already {invite.status.toLowerCase()}.
				</output>
			) : (
				<div className="flex flex-col gap-3">
					{actionError ? (
						<p
							aria-live="polite"
							className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-pretty text-red-700 text-sm"
							role="alert"
						>
							{actionError}
						</p>
					) : null}
					<button
						className={primaryButtonClassName}
						disabled={Boolean(submittingAction)}
						onClick={onAccept}
						type="button"
					>
						<CheckIcon className="size-4" />
						{submittingAction === "accept" ? "Accepting..." : "Accept invite"}
					</button>
					<button
						className={secondaryButtonClassName}
						disabled={Boolean(submittingAction)}
						onClick={onDecline}
						type="button"
					>
						<XIcon className="size-4" />
						{submittingAction === "decline" ? "Declining..." : "Decline"}
					</button>
				</div>
			)}
		</InviteShell>
	);
}

function InviteMetaRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-start justify-between gap-4">
			<span className="shrink-0 text-neutral-500">{label}</span>
			<span className="min-w-0 text-right text-pretty font-medium">
				{value}
			</span>
		</div>
	);
}

function InviteShell({
	children,
	description,
	icon,
	title,
}: {
	children?: React.ReactNode;
	description: string;
	icon: React.ReactNode;
	title: string;
}) {
	return (
		<div className="flex w-full max-w-md flex-col gap-6 px-5 sm:px-10 md:px-0">
			<a
				className="absolute top-5 hidden font-medium text-xl sm:block"
				href="https://selfmail.app"
			>
				Selfmail
			</a>
			<div className="flex items-center justify-center">
				<div className="flex size-14 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-900">
					{icon}
				</div>
			</div>
			<div className="space-y-2 text-center">
				<h1 className="text-balance font-medium text-3xl">{title}</h1>
				<p className="text-pretty text-neutral-700 text-sm">{description}</p>
			</div>
			{children}
		</div>
	);
}

const primaryButtonClassName =
	"hit-area-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-center text-white transition-colors duration-200 hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500";

const secondaryButtonClassName =
	"hit-area-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-neutral-200 px-6 py-3 text-center text-neutral-900 transition-colors duration-200 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-neutral-100 disabled:text-neutral-400";
