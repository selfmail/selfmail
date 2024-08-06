"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { Button, Input } from "ui";
import { z } from "zod";
import { createComment } from "./action";

export const initialState = {
  message: undefined,
  error: undefined,
};

/**
 * Form for creating a new comment. The site will be reoloaded to show the changes.
 *
 * @returns {JSX.Element}
 */

export default function CreateCommentForm(): JSX.Element {
  const [error, setError] = useState<string | undefined>(undefined);
  const [state, formAction] = useFormState(createComment, initialState);
  const [description, setDescription] = useState<number>(0);
  const [content, setContent] = useState<number>(0);
  const formDataSchema = z.object({
    title: z.string().min(3),
    description: z.string(),
    content: z.string().min(8).max(2048),
    allowComments: z.boolean(),
  });
  return (
    <form
      className="flex flex-col"
      action={async (e: FormData) => {
        setError(undefined);
        const clientParse = formDataSchema.safeParse({
          title: e.get("title") as string,
          description: e.get("description") as string,
          content: e.get("content") as string,
          allowComments: e.get("allowComments") === "on" ? true : false,
        });
        if (!clientParse.success) {
          setError("Validation error. Please check the provided fields.");
          return;
        }
        formAction(e);
      }}
    >
      <h3 className="text-xl">Create a comment</h3>
      <textarea
        className="mt-2 rounded-xl border-2 border-[#dddddddd] bg-[#f4f4f4] p-2 focus-visible:border-[#666666] focus-visible:outline-none"
        placeholder="Content"
      />
      <div>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
