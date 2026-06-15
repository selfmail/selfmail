import { Dialog } from "@base-ui/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { cn } from "#/lib/utils";
import { settingsPages } from "./menu/pages";
import SettingsSidebar from "./menu/sidebar";
import type { SettingsPageId } from "./settings-pages";
import { settingsPageIds } from "./settings-pages";

export type Page = SettingsPageId;

interface SettingsDialogPayload {
  page: Page;
}

export const settingsDialogHandle =
  Dialog.createHandle<SettingsDialogPayload>();

const pages = settingsPageIds;

function hasSettingsPageParam() {
  return (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("settings-page")
  );
}

function getActivePage(page: string) {
  return settingsPages.find((element) => element.id === page);
}

function SettingsDialogContent({
  open,
  page,
  workspaceId,
  memberId,
  payload,
  setPage,
}: {
  open: boolean;
  page: Page | null;
  workspaceId: string;
  memberId: string;
  payload?: SettingsDialogPayload;
  setPage: ReturnType<typeof useSettingsPageQuery>[1];
}) {
  const activePage = page ?? "app";
  const syncedPayloadPageRef = useRef<Page | null>(null);
  const currentActivePage = getActivePage(page as string);

  useEffect(() => {
    if (!open) {
      syncedPayloadPageRef.current = null;
      return;
    }

    if (payload?.page && syncedPayloadPageRef.current !== payload.page) {
      syncedPayloadPageRef.current = payload.page;
      setPage(payload.page);
      return;
    }

    if (!hasSettingsPageParam()) {
      setPage(activePage);
    }
  }, [activePage, open, payload?.page, setPage]);

  if (!currentActivePage) {
    return;
  }
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className={cn("fixed inset-0 z-50 bg-black/20")} />
      <Dialog.Viewport
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4"
        )}
      >
        <Dialog.Popup
          className={cn(
            "flex w-[calc(100vw-2rem)] max-w-4xl flex-row overflow-hidden rounded-xl bg-neutral-100 sm:h-152"
          )}
          style={{
            maxHeight:
              "calc(100dvh - 2rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
          }}
        >
          <SettingsSidebar activePageId={activePage} setPage={setPage} />
          <div className="flex min-h-0 w-full flex-1 p-2">
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border/50 bg-neutral-50 p-2">
              <h1 className="font-medium text-xl">
                {currentActivePage.title()}
              </h1>
              <currentActivePage.component
                id={currentActivePage.id}
                memberId={memberId}
                title={currentActivePage.title}
                workspaceId={workspaceId}
              />
            </div>
          </div>
          <Dialog.Description />
          <Dialog.Close />
        </Dialog.Popup>
      </Dialog.Viewport>
    </Dialog.Portal>
  );
}

function useSettingsPageQuery() {
  return useQueryState(
    "settings-page",
    parseAsStringLiteral(pages).withOptions({
      clearOnDefault: false,
      history: "push",
    })
  );
}

export default function SettingsDialog({
  workspaceId,
  memberId,
}: {
  workspaceId: string;
  memberId: string;
}) {
  const [page, setPage] = useSettingsPageQuery();
  const [open, setOpen] = useState(false);
  const [triggerId, setTriggerId] = useState<string | null>(null);

  if (page !== null && !open) {
    setOpen(true);
  }

  const handleOpenChange = (
    isOpen: boolean,
    eventDetails: Dialog.Root.ChangeEventDetails
  ) => {
    if (!isOpen) {
      setPage(null);
    }
    setOpen(isOpen);
    setTriggerId(eventDetails.trigger?.id ?? null);
  };

  return (
    <Dialog.Root
      handle={settingsDialogHandle}
      onOpenChange={handleOpenChange}
      open={open}
      triggerId={triggerId}
    >
      {({ payload }) => {
        return (
          <SettingsDialogContent
            memberId={memberId}
            open={open}
            page={page}
            payload={payload}
            setPage={setPage}
            workspaceId={workspaceId}
          />
        );
      }}
    </Dialog.Root>
  );
}
