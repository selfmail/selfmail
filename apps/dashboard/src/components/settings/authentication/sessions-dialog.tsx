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
	Button,
	buttonVariants,
} from "@selfmail/ui";
import { useMutation } from "@tanstack/react-query";
import { useId, useState } from "react";
import { deleteAllSessions } from "#/lib/settings/authentication";
import { m } from "#/paraglide/messages";

export function SessionsDialog({ sessionCount }: { sessionCount: number }) {
	const [open, setOpen] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);
	const errorId = useId();
	const deleteSessions = useMutation({
		mutationFn: () => deleteAllSessions(),
		onError: (error) => setActionError(error.message),
		onSuccess: ({ loginHref }) => window.location.assign(loginHref),
	});
	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		setActionError(null);
	};

	return (
		<AlertDialog onOpenChange={handleOpenChange} open={open}>
			<AlertDialogTrigger asChild>
				<Button disabled={sessionCount === 0} size="sm" variant="outline">
					{m["dashboard.settings.authentication.delete_sessions"]()}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="max-w-md">
				<AlertDialogHeader>
					<AlertDialogTitle>
						{m["dashboard.settings.authentication.delete_sessions_title"]()}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{m["dashboard.settings.authentication.delete_sessions_description"](
							{ count: sessionCount },
						)}
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
						disabled={deleteSessions.isPending}
						onClick={() => deleteSessions.mutate()}
						type="button"
					>
						{deleteSessions.isPending
							? m["dashboard.settings.authentication.deleting_sessions"]()
							: m["dashboard.settings.authentication.delete_sessions"]()}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
