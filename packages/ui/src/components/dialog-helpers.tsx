import type { ComponentPropsWithoutRef } from "react";
import { Button } from "./button";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

export function DialogAction(props: ComponentPropsWithoutRef<typeof Button>) {
  return <Button {...props} />;
}

export function DialogCancel(props: ComponentPropsWithoutRef<typeof Button>) {
  return <Button variant="outline" {...props} />;
}
