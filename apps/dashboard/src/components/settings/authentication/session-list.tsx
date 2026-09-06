import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	Badge,
	Button,
	buttonVariants,
} from "@selfmail/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOutIcon, MapPinIcon, MonitorIcon } from "lucide-react";
import { useId, useState } from "react";
import {
	deleteSession,
	type getAuthenticationSettings,
} from "#/lib/settings/authentication";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import { getSessionDevice } from "./session-device";

type AuthenticationSettings = Awaited<
	ReturnType<typeof getAuthenticationSettings>
>;
type Session = AuthenticationSettings["sessions"][number];

const formatDate = (value: string) =>
	new Intl.DateTimeFormat(getLocale(), {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));

function DeleteSessionDialog({ session }: { session: Session }) {
	const [open, setOpen] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);
	const errorId = useId();
	const queryClient = useQueryClient();
	const deleteMutation = useMutation({
		mutationFn: () => deleteSession({ data: { sessionId: session.id } }),
		onError: (error) => setActionError(error.message),
		onSuccess: async ({ isCurrent, loginHref }) => {
			if (isCurrent && loginHref) {
				window.location.assign(loginHref);
				return;
			}

			await queryClient.invalidateQueries({
				queryKey: ["authentication-settings"],
			});
			setOpen(false);
		},
	});

	return (
		<AlertDialog
			onOpenChange={(isOpen) => {
				setOpen(isOpen);
				setActionError(null);
			}}
			open={open}
		>
			<AlertDialogTrigger asChild>
				<Button
					aria-label={m["dashboard.settings.authentication.delete_session"]()}
					className="shrink-0 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
					size="icon-sm"
					type="button"
					variant="ghost"
				>
					<LogOutIcon aria-hidden="true" className="size-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="max-w-md">
				<AlertDialogHeader>
					<AlertDialogTitle>
						{m["dashboard.settings.authentication.delete_session_title"]()}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{m[
							"dashboard.settings.authentication.delete_session_description"
						]()}
					</AlertDialogDescription>
				</AlertDialogHeader>
				{actionError ? (
					<p className="text-pretty text-destructive text-sm" id={errorId}>
						{actionError}
					</p>
				) : null}
				<AlertDialogFooter>
					<AlertDialogCancel type="button">
						{m["dashboard.settings.cancel"]()}
					</AlertDialogCancel>
					<AlertDialogAction
						aria-describedby={actionError ? errorId : undefined}
						className={buttonVariants({ variant: "destructive" })}
						disabled={deleteMutation.isPending}
						onClick={() => deleteMutation.mutate()}
						type="button"
					>
						{deleteMutation.isPending
							? m["dashboard.settings.authentication.deleting_session"]()
							: m["dashboard.settings.authentication.delete_session"]()}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export function SessionList({ sessions }: { sessions: Session[] }) {
	return (
		<ul className="grid list-none divide-y divide-border">
			{[...sessions]
				.sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent))
				.map((session) => (
					<li className="flex items-start gap-3 py-4" key={session.id}>
						<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
							<MonitorIcon aria-hidden="true" className="size-4" />
						</div>
						<div className="grid min-w-0 flex-1 gap-1.5">
							<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
								<span
									className="min-w-0 break-words font-medium text-sm"
									title={session.userAgent ?? undefined}
								>
									{getSessionDevice(session.userAgent) ??
										m["dashboard.settings.authentication.unknown_user_agent"]()}
								</span>
								{session.isCurrent ? (
									<Badge className="gap-1.5 px-2 text-xs" variant="secondary">
										<span
											aria-hidden="true"
											className="size-1.5 rounded-full bg-current"
										/>
										{m["dashboard.settings.authentication.current_session"]()}
									</Badge>
								) : null}
							</div>
							<span className="flex min-w-0 items-center gap-1 text-muted-foreground text-xs">
								<MapPinIcon aria-hidden="true" className="size-3 shrink-0" />
								<span className="break-words">
									{session.region ??
										m["dashboard.settings.authentication.unknown_region"]()}
								</span>
							</span>
							<div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground text-xs leading-relaxed tabular-nums">
								<time dateTime={session.createdAt}>
									{m["dashboard.settings.authentication.created_at"]({
										date: formatDate(session.createdAt),
									})}
								</time>
								<time dateTime={session.expires}>
									{m["dashboard.settings.authentication.expires_at"]({
										date: formatDate(session.expires),
									})}
								</time>
							</div>
						</div>
						<DeleteSessionDialog session={session} />
					</li>
				))}
		</ul>
	);
}
