import { Button } from "@selfmail/ui";
import { CircleAlertIcon, RefreshCwIcon } from "lucide-react";
import {
  Alert,
  AlertDescription,
  SettingsBlock,
  SettingsGroup,
  Skeleton,
} from "#/components/ui";

interface SettingsPageProps {
  children: React.ReactNode;
  description?: string | null;
  error?: (string | null | undefined)[];
  loading?: boolean[];
  onRetry?: () => unknown;
  retryLabel?: string;
}

function SettingsPageSkeleton({
  showDescription,
}: {
  showDescription: boolean;
}) {
  const rows = ["profile", "access", "notifications"] as const;

  return (
    <div
      aria-busy="true"
      className="grid w-full gap-6 overflow-hidden motion-safe:animate-pulse"
    >
      {showDescription ? <Skeleton className="h-4 w-3/4 max-w-md" /> : null}
      <SettingsGroup>
        {rows.map((row, index) => (
          <SettingsBlock
            control={
              <Skeleton className={index === 0 ? "h-9 w-40" : "h-8 w-24"} />
            }
            description={
              <Skeleton
                className={index === 1 ? "h-4 w-48" : "h-4 w-64 max-w-full"}
              />
            }
            key={row}
            title={
              <Skeleton className={index === 2 ? "h-4 w-28" : "h-4 w-36"} />
            }
          />
        ))}
      </SettingsGroup>
      <div className="grid gap-3">
        <Skeleton className="h-4 w-32" />
        <SettingsGroup>
          <SettingsBlock
            control={<Skeleton className="h-9 w-28" />}
            description={<Skeleton className="h-4 w-72 max-w-full" />}
            title={<Skeleton className="h-4 w-40" />}
          />
        </SettingsGroup>
      </div>
    </div>
  );
}

function SettingsPageError({
  errors,
  onRetry,
  retryLabel,
}: {
  errors: string[];
  onRetry?: () => unknown;
  retryLabel?: string;
}) {
  return (
    <div className="grid min-h-64 place-items-center px-4 py-8">
      <Alert className="max-w-md" variant="destructive">
        <div className="flex gap-3">
          <CircleAlertIcon
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0"
          />
          <div className="grid min-w-0 flex-1 gap-4">
            <AlertDescription>
              {errors.length === 1 ? (
                errors[0]
              ) : (
                <ul className="list-disc space-y-1 pl-4">
                  {errors.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
            {onRetry && retryLabel ? (
              <Button
                className="w-fit"
                onClick={onRetry}
                type="button"
                variant="outline"
              >
                <RefreshCwIcon aria-hidden="true" className="size-4" />
                {retryLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </Alert>
    </div>
  );
}

export function SettingsPage({
  loading,
  description,
  error,
  children,
  onRetry,
  retryLabel,
}: SettingsPageProps) {
  if (loading?.some(Boolean)) {
    return <SettingsPageSkeleton showDescription={Boolean(description)} />;
  }

  const errors = [
    ...new Set(
      error?.filter((message): message is string => Boolean(message?.trim())) ??
        []
    ),
  ];

  if (errors.length > 0) {
    return (
      <SettingsPageError
        errors={errors}
        onRetry={onRetry}
        retryLabel={retryLabel}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden">
      {children}
    </div>
  );
}
