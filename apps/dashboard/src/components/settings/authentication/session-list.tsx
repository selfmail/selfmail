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
import { ClockIcon, MapPinIcon, MonitorIcon, Trash2Icon } from "lucide-react";
import { useId, useState } from "react";
import {
  deleteSession,
  type getAuthenticationSettings,
} from "#/lib/settings/authentication";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";

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
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Trash2Icon aria-hidden="true" className="size-4" />
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
    <ul className="grid list-none">
      {sessions.map((session) => (
        <li
          className="grid gap-3 border-border border-b py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
          key={session.id}
        >
          <div className="min-w-0 space-y-2">
            <div className="flex min-w-0 items-center gap-2">
              <MapPinIcon
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
              />
              <span className="truncate font-medium text-sm">
                {session.region ??
                  m["dashboard.settings.authentication.unknown_region"]()}
              </span>
              {session.isCurrent ? (
                <Badge variant="secondary">
                  {m["dashboard.settings.authentication.current_session"]()}
                </Badge>
              ) : null}
            </div>
            <div className="flex min-w-0 items-start gap-2 text-muted-foreground text-sm">
              <MonitorIcon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
              <span className="text-pretty break-all">
                {session.userAgent ??
                  m["dashboard.settings.authentication.unknown_user_agent"]()}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs tabular-nums">
              <span className="flex items-center gap-1.5">
                <ClockIcon aria-hidden="true" className="size-3.5" />
                {m["dashboard.settings.authentication.created_at"]({
                  date: formatDate(session.createdAt),
                })}
              </span>
              <span>
                {m["dashboard.settings.authentication.expires_at"]({
                  date: formatDate(session.expires),
                })}
              </span>
            </div>
          </div>
          <DeleteSessionDialog session={session} />
        </li>
      ))}
    </ul>
  );
}
