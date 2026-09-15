import { Send } from "lucide-react";
import { m } from "#/paraglide/messages";
import { AccountSwitcher } from "./account-switcher";
import type { DashboardHeaderProps } from "./types";

export function DashboardHeader({
  currentWorkspace,
  onComposeOpen,
}: DashboardHeaderProps) {
  return (
    <header className="flex w-full flex-row items-center justify-between gap-4">
      <AccountSwitcher currentWorkspace={currentWorkspace} />
      <button
        className="flex cursor-pointer items-center gap-x-3 rounded-2xl border border-border px-4 py-2 text-center text-muted-foreground text-sm hover:bg-accent hover:text-accent-foreground hover:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
        onClick={() => onComposeOpen({})}
        type="button"
      >
        <Send className="inline-block size-4" />
        <span>{m["dashboard.header.compose"]()}</span>
      </button>
    </header>
  );
}
