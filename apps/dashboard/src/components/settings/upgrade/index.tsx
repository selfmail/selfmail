import { CreditCardIcon } from "lucide-react";
import { Button, SettingsBanner } from "#/components/ui";
import type { SettingsPageContext } from "../menu/pages";

const benefits = [
  "Higher mailbox storage",
  "Advanced spam analysis",
  "Workspace AI",
  "Team permissions and audit logs",
  "Priority support",
] as const;

export function UpgradeSettingsPage({ description }: SettingsPageContext) {
  return (
    <div className="grid gap-4">
      {description ? <SettingsBanner description={description()} /> : null}
      <div className="flex min-h-80 flex-col items-center justify-center gap-5 rounded-xl border border-dashed p-6 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <CreditCardIcon aria-hidden="true" className="size-5" />
        </div>

        <div className="space-y-1">
          <p className="text-balance font-medium text-sm">Upgrade to Pro</p>
          <p className="max-w-sm text-pretty text-muted-foreground text-sm">
            Get more storage, control, and support for your workspace.
          </p>
        </div>

        <ul className="grid max-w-sm list-inside list-disc gap-1.5 text-left text-muted-foreground text-sm">
          {benefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>

        <Button>Upgrade to Pro</Button>
      </div>
    </div>
  );
}
