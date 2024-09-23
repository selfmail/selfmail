"use client";

import { Button, Input } from "ui";
import { deletePostByMod } from "./action";

export default function ModDeletionModal({
  userId,
  modId,
  postId,
}: {
  userId: string;
  modId: string;
  postId: string;
}) {
  return (
    <form
      action={async (e) => {
        await deletePostByMod(e, postId, userId, modId);
      }}
    >
      <Input placeholder="The reason" />
      <Button type="submit">Submit</Button>
    </form>
  );
}
