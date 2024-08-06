import { db } from "database";
import { cn } from "lib/cn";
import { ChevronLeft, Trash } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, ButtonStyles } from "node_modules/ui/src/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "ui";
import DeleteButton from "./delete-button";
import { DeleteMail } from "./action";

export default async function Email({
  params,
}: {
  params: {
    email: string;
  };
}) {
  const email = await db.email.findUnique({
    where: {
      id: params.email,
    },
  });
  if (!email) notFound();
  return (
    <div className="p-4">
      <header className="flex items-center justify-between">
        <div className="items-cener flex space-x-2">
          <div className="flex items-center">
            <Link href={"/"}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
          <Link href={`/contacts/${email.sender}`}>{email.sender}</Link>
        </div>
        <div className="flex items-center">
          <Dialog>
            <DialogTrigger className="rounded-md border border-[#666666] p-1 hover:bg-neutral-100">
              <Trash className="h-4 w-4" color="red" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>Delete this email?</DialogHeader>
              <DialogDescription>
                Are you sure to delete this email? You are not able to undo this
                action.
              </DialogDescription>
              <DialogFooter className="flex items-center justify-end space-x-3">
                <DialogClose>No</DialogClose>
                <DialogClose>
                  <DeleteButton id={email.id} action={DeleteMail} />
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <p className="text-sm">
            {email.createdAt.toLocaleDateString()}{" "}
            {email.createdAt.toLocaleTimeString()}
          </p>
        </div>
      </header>
      <h1 className="text-2xl font-medium">{email.subject}</h1>
      <p className="text-[#666666]">{email.content}</p>
    </div>
  );
}
