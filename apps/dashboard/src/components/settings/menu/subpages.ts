import type { ReactNode } from "react";
import type { Page } from "..";
import { DomainConsolePage } from "../domains/console";
import type { SettingsPageContext } from "./pages";

export interface SettingsSubpageContext extends SettingsPageContext {
  itemId: string | null;
  onBack: () => void;
}

interface SettingsSubpage {
  id: string;
  parent: Page;
  component: (props: SettingsSubpageContext) => ReactNode;
}

export const settingsSubpages = [
  { id: "domain-console", parent: "domains", component: DomainConsolePage },
] as const satisfies readonly SettingsSubpage[];
