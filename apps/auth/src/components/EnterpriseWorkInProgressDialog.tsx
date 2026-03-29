import type { ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";
import { m } from "#/paraglide/messages";

interface EnterpriseWorkInProgressDialogProps {
  children: ReactNode;
}

export default function EnterpriseWorkInProgressDialog({
  children,
}: EnterpriseWorkInProgressDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m["enterprise_dialog.title"]()}</DialogTitle>
          <DialogDescription>
            {m["enterprise_dialog.description"]()}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <button
              className="inline-flex h-10 items-center justify-center rounded-md bg-neutral-900 px-4 py-2 font-medium text-sm text-white transition-colors duration-200 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
              type="button"
            >
              {m["enterprise_dialog.close"]()}
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
