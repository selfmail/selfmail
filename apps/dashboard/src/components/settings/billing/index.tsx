import { CreditCardIcon } from "lucide-react";
import { Button, SettingsBanner } from "#/components/ui";
import { m } from "#/paraglide/messages";
import type { SettingsPageContext } from "../menu/pages";

export function BillingSettingsPage({ description }: SettingsPageContext) {
  return (
    <div className="grid gap-4">
      {description && <SettingsBanner description={description()} />}
      <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-6 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <CreditCardIcon aria-hidden="true" className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-balance font-medium text-sm">
            {m["dashboard.settings.billing.empty_title"]()}
          </p>
          <p className="max-w-sm text-pretty text-muted-foreground text-sm">
            {m["dashboard.settings.billing.empty_description"]()}
          </p>
        </div>
        <Button>Upgrade to Pro</Button>
      </div>
    </div>
  );
}
