"use client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ButtonStyles } from "node_modules/ui/src/components/button";
import { toast } from "sonner";
import { Button } from "ui";

export default function DeleteButton({
  action,
  id,
}: {
  action: (id: string) => Promise<void | string>;
  id: string;
}) {
  // TODO: implement a reload after the link so that the changes are visible
  return (
    <Link
      href="/"
      className={ButtonStyles({ variant: "danger" })}
      onClick={async () => {
        const msg = await action(id);
        if (msg) return toast.error(`Could not delete mail: ${msg}.`);
        toast.success("Delete mail successfully.");
      }}
    >
      Delete
    </Link>
  );
}
