import { m } from "#/paraglide/messages";
import type { SettingsPageContext } from "../menu/pages";

export function AuthenticationSettingsPage({ title }: SettingsPageContext) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed p-6 text-center text-muted-foreground text-sm">
      {m["dashboard.settings.menu.placeholder"]({ pageTitle: title() })}
    </div>
  );
}
