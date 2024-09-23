"use client";

import { Trash } from "lucide-react";
import { deletePost } from "./action";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "ui";

export default function TrashButton({ id }: { id: string }) {
  return (
    <Dialog>
      <DialogTrigger>
        <Trash className="h-4 w-4 cursor-pointer text-red-400" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Are you sure?</DialogHeader>
        <DialogDescription>
          You can't revert this action back. If you delete your post, you CAN'T
          restore it.
        </DialogDescription>
        <DialogFooter>
          <DialogClose>
            <Button variant={"secondary"} className="mr-3">
              Go back
            </Button>
          </DialogClose>
          <DialogClose>
            <Button
              onClick={async () => {
                await deletePost(id);
              }}
            >
              Delete
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
