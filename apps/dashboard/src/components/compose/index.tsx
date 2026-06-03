import { Dialog } from "@base-ui/react";
import { useEffect, useState } from "react";
import { composeDialogHandle } from "./handle";

export default function ComposeDialog() {
  const [open, setOpen] = useState(false);
  const [triggerId, setTriggerId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      document.title = "Compose new Email - Selfmail";
    } else {
      document.title = "Selfmail";
    }
  }, [open]);
  const handleOpenChange = (
    isOpen: boolean,
    eventDetails: Dialog.Root.ChangeEventDetails
  ) => {
    setOpen(isOpen);
    setTriggerId(eventDetails.trigger?.id ?? null);
  };

  return (
    <Dialog.Root
      handle={composeDialogHandle}
      onOpenChange={handleOpenChange}
      open={open}
      triggerId={triggerId}
    >
      {() => (
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/20" />
          <Dialog.Viewport className="fixed inset-0 z-50 flex items-end justify-center px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6">
            <Dialog.Popup className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-muted text-foreground outline-none">
              <form className="flex w-full flex-col gap-1.5 rounded-b-3xl bg-background p-3 pb-3">
                <h1 className="font-medium text-2xl">Compose new Email</h1>
                <input
                  className="border-none outline-none"
                  placeholder="From"
                  type="text"
                />
                <input
                  className="border-none outline-none"
                  placeholder="To"
                  type="text"
                />
                <input
                  className="border-none outline-none"
                  placeholder="Subject"
                  type="text"
                />
                <div className="h-0.5 w-full bg-border" />
                <textarea
                  className="border-none outline-none"
                  id=""
                  name=""
                  placeholder="Write your email..."
                  rows={6}
                />
              </form>
              <div className="flex w-full flex-row items-center justify-end gap-2 bg-muted p-3">
                <button
                  className="rounded-md border-2 border-border bg-background px-4 py-2 font-medium text-foreground text-sm hover:bg-accent"
                  onClick={() => composeDialogHandle.close()}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  );
}
