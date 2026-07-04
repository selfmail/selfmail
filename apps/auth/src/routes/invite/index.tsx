import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Building2Icon,
	CheckIcon,
	CircleAlertIcon,
	MailIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import z from "zod";
import { getAppRedirectUrlFn, getCurrentUserFn } from "#/libs/session";
import { cn } from "#/libs/utils";
import { m } from "#/paraglide/messages";
import { acceptInvite, checkInviteToken } from "#/utils/invite";

const inviteSearchSchema = z.object({
	token: z
		.string()
		.trim()
		.optional()
		.transform((token) => (token ? token.slice(0, 256) : undefined)),
});

export const Route = createFileRoute("/invite/")({
	component: RouteComponent,
	head: () => ({
		meta: [
			{
				title: m["invite.meta_title"](),
			},
		],
	}),
	validateSearch: inviteSearchSchema,
	loaderDeps: ({ search }) => ({
		token: search.token,
	}),
	loader: async ({ deps }) => ({
		dashboardUrl: await getAppRedirectUrlFn(),
		currentUser: await getCurrentUserFn(),
		invite: deps.token
			? await checkInviteToken({
					data: {
						token: deps.token,
					},
				})
			: null,
	}),
});

function RouteComponent() {
	const { invite, dashboardUrl, currentUser } = Route.useLoaderData();
	const [error, setError] = useState<string | null>(null);
	const { token } = Route.useSearch();
	const invitedBy = invite?.invitedBy ?? m["invite.default_inviter"]();
	const workspaceName =
		invite?.workspaceName ?? m["invite.default_workspace_name"]();
	const acceptInviteMutation = useMutation({
		mutationFn: async () =>
			token &&
			acceptInvite({
				data: {
					token,
				},
			}),
		onMutate: () => {
			setError(null);
		},
		onError: (error) => {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError(m["invite.unknown_error"]());
			}
		},
		onSuccess: () => {
			window.location.href = dashboardUrl;
		},
	});

	if (!token) {
		return (
			<InviteShell
				description={m["invite.no_invite.description"]()}
				icon={<MailIcon className="size-6" />}
				title={m["invite.no_invite.title"]()}
			>
				<div className="flex flex-col gap-3">
					<Link className={primaryButtonClassName} to="/login">
						{m["invite.sign_in"]()}
					</Link>
					<Link className={secondaryButtonClassName} to="/register">
						{m["invite.create_account"]()}
					</Link>
				</div>
			</InviteShell>
		);
	}

	if (invite?.valid !== true) {
		return (
			<InviteShell
				description={m["invite.unavailable.description"]()}
				icon={<CircleAlertIcon className="size-6" />}
				title={m["invite.unavailable.title"]()}
			>
				<Link className={secondaryButtonClassName} to="/login">
					{m["invite.back_to_login"]()}
				</Link>
			</InviteShell>
		);
	}

	if (!currentUser) {
		return (
			<InviteShell
				description={m["invite.guest_description"]({
					invitedBy,
					workspaceName,
				})}
				icon={<MailIcon className="size-6" />}
				title={m["invite.auth_required.title"]()}
			>
				<div className="flex flex-col gap-3">
					<Link className={primaryButtonClassName} to="/login">
						{m["invite.sign_in"]()}
					</Link>
					<Link className={secondaryButtonClassName} to="/register">
						{m["invite.create_account"]()}
					</Link>
				</div>
			</InviteShell>
		);
	}

	return (
		<InviteShell
			description={m["invite.authenticated_description"]({ invitedBy })}
			icon={<Building2Icon className="size-6" />}
			title={workspaceName}
		>
			<div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
				<div className="grid gap-2">
					<InviteMetaRow
						label={m["invite.labels.signed_in_as"]()}
						value={currentUser.email}
					/>
					<InviteMetaRow
						label={m["invite.labels.invited_by"]()}
						value={invitedBy}
					/>
					<InviteMetaRow
						label={m["invite.labels.workspace"]()}
						value={workspaceName}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-3">
				{error ? (
					<p
						aria-live="polite"
						className="text-pretty rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm"
						role="alert"
					>
						{error}
					</p>
				) : null}
				<button
					className={primaryButtonClassName}
					disabled={acceptInviteMutation.isPending}
					onClick={() => acceptInviteMutation.mutate()}
					type="button"
				>
					{acceptInviteMutation.isPending ? (
						m["invite.accepting"]()
					) : (
						<>
							<CheckIcon className="size-4" />
							{m["invite.accept"]()}
						</>
					)}
				</button>
			</div>
		</InviteShell>
	);
}

function InviteShell({
	children,
	description,
	icon,
	title,
}: {
	children?: ReactNode;
	description: string;
	icon: ReactNode;
	title: string;
}) {
	return (
		<>
			<a
				className="absolute top-5 hidden font-medium text-xl sm:block"
				href="https://selfmail.app"
			>
				Selfmail
			</a>
			<div className="flex w-full max-w-md flex-col gap-6 px-5 sm:px-10 md:px-0">
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
		</>
	);
}

function InviteMetaRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-start justify-between gap-4">
			<span className="shrink-0 text-neutral-500">{label}</span>
			<span className="min-w-0 text-pretty text-right font-medium">
				{value}
			</span>
		</div>
	);
}

const primaryButtonClassName = cn(
	"hit-area-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-center text-white transition-colors duration-200 hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500",
);

const secondaryButtonClassName = cn(
	"hit-area-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-neutral-200 px-6 py-3 text-center text-neutral-900 transition-colors duration-200 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 focus-visible:ring-offset-2",
);
