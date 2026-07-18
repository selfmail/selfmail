import { Input, Label } from "@selfmail/ui";
import { m } from "#/paraglide/messages";
import { useOnboardingStore } from "#/stores/onboarding";

interface OnboardingAddressProps {
  error?: string;
}

const toAddressLocalPart = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, "")
    .replace(/^[._-]+|[._-]+$/g, "");

export function OnboardingAddress({ error }: OnboardingAddressProps) {
  const { data, setField } = useOnboardingStore();
  const domain = data.useCustomDomain
    ? data.customDomain || "mail.yourdomain.com"
    : "workspace.selfmail.app";
  const address = `${data.defaultAddress || "hello"}@${domain}`;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-balance font-medium text-3xl">
        {m["onboarding.address.title"]()}
      </h1>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="default-address">
            {m["onboarding.address.field.label"]()}
          </Label>
          <div className="grid grid-cols-[minmax(7rem,1fr)_minmax(8rem,45%)]">
            <Input
              aria-describedby={
                error ? "default-address-error" : "default-address-help"
              }
              aria-invalid={Boolean(error)}
              className="rounded-r-none border-r border-r-border"
              id="default-address"
              onChange={(event) =>
                setField(
                  "defaultAddress",
                  toAddressLocalPart(event.target.value)
                )
              }
              placeholder={m["onboarding.address.field.placeholder"]()}
              value={data.defaultAddress}
            />
            <div
              className="flex h-12 min-w-0 items-center rounded-r-full rounded-l-none border-2 border-border border-l-0 bg-muted px-4 text-muted-foreground text-sm"
              title={`@${domain}`}
            >
              <span className="truncate">@{domain}</span>
            </div>
          </div>
          {error ? (
            <p
              className="text-pretty text-destructive text-sm"
              id="default-address-error"
            >
              {error}
            </p>
          ) : (
            <p
              className="text-pretty text-muted-foreground text-sm"
              id="default-address-help"
            >
              {m["onboarding.address.preview"]()}{" "}
              <span className="font-medium text-foreground">{address}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
