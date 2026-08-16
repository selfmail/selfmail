import { Building2Icon } from "lucide-react";
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
      <DialogContent className="gap-6">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-border bg-muted">
          <Building2Icon className="size-6 text-muted-foreground" />
        </div>
        <DialogHeader className="items-center gap-3 text-center">
          <DialogTitle>{m["enterprise_dialog.title"]()}</DialogTitle>
          <DialogDescription className="max-w-sm text-center">
            {m["enterprise_dialog.description"]()}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <button
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground text-sm transition-colors duration-200 hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
