import {
  SettingsDialog,
  SettingsDialogContent,
  SettingsDialogDescription,
  SettingsDialogHeader,
  SettingsDialogMain,
  SettingsDialogSidebar,
  SettingsDialogTitle,
  SettingsMenu,
  SettingsMenuItem,
} from "#/components/ui";
import { SettingsPageContent } from "./settings-page-content";
import { getSettingsPage, settingsPages } from "./settings-pages";
import { useSettingsPage } from "./use-settings-page";

interface DashboardSettingsMenuProps {
  workspaceName: string;
}

export function DashboardSettingsMenu({
  workspaceName,
}: DashboardSettingsMenuProps) {
  const [pageId, setPageId] = useSettingsPage();
  const activePage = getSettingsPage(pageId ?? "general");
  const handleOpenChange = (open: boolean) => {
    setPageId(open ? (pageId ?? "general") : null);
  };

  return (
    <SettingsDialog onOpenChange={handleOpenChange} open={pageId !== null}>
      <SettingsDialogContent>
        <SettingsDialogSidebar>
          <SettingsMenu aria-label="Settings sections">
            {settingsPages.map((page) => (
              <SettingsMenuItem
                active={activePage.id === page.id}
                icon={<page.icon />}
                key={page.id}
                onClick={() => setPageId(page.id)}
              >
                {page.title}
              </SettingsMenuItem>
            ))}
          </SettingsMenu>
        </SettingsDialogSidebar>
        <SettingsDialogMain>
          <SettingsDialogHeader>
            <SettingsDialogTitle>{activePage.title}</SettingsDialogTitle>
            <SettingsDialogDescription>
              {activePage.description}
            </SettingsDialogDescription>
          </SettingsDialogHeader>
          <SettingsPageContent
            page={activePage}
            workspaceName={workspaceName}
          />
        </SettingsDialogMain>
      </SettingsDialogContent>
    </SettingsDialog>
  );
}
