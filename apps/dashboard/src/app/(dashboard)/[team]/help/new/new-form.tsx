"use client";

import { cn } from "@/lib/cn";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Input } from "ui";
import { z } from "zod";
import { createPost } from "./action";
export const initialState = {
  message: undefined,
  error: undefined,
};

export default function NewForm() {
  const [error, setError] = useState<string | undefined>(undefined);
  const [state, formAction] = useActionState(createPost, initialState);
  const [description, setDescription] = useState<number>(0);
  const [content, setContent] = useState<number>(0);
  const formDataSchema = z.object({
    title: z.string().min(3),
    description: z.string(),
    content: z.string().min(8).max(2048),
    allowComments: z.boolean(),
  });
  const { pending } = useFormStatus();
  return (
    <form
      action={(e: FormData) => {
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
      className="flex flex-col lg:w-[500px]"
    >
      <Input placeholder="Title" min={3} max={25} name="title" />
      <textarea
        className="mt-2 rounded-xl border-2 border-[#dddddddd] bg-[#f4f4f4] p-2 focus-visible:border-[#666666] focus-visible:outline-none"
        onChange={(e) => setDescription(e.currentTarget.value.length)}
        placeholder="description"
        minLength={10}
        maxLength={250}
        name="description"
      />
      <p
        className={cn(
          "mb-2 text-end",
          description < 10 ? "text-red-500" : "text-green-500",
        )}
      >
        {description}/250
      </p>
      <textarea
        className="rounded-xl border-2 border-[#dddddddd] bg-[#f4f4f4] p-2 focus-visible:border-[#666666] focus-visible:outline-none"
        onChange={(e) => setContent(e.currentTarget.value.length)}
        placeholder="content"
        minLength={100}
        maxLength={2048}
        name="content"
      />
      <p
        className={cn(
          "mb-2 text-end",
          content < 100 ? "text-red-500" : "text-green-500",
        )}
      >
        {content}/2048
      </p>
      <div className="flex">
        <input type="checkbox" name="allowComments" id="allow-comments" />
        <label htmlFor="allow-comments">Allow comments?</label>
      </div>
      {(error && <div className="text-red-500">{error}</div>) ||
        (state.error && <div className="text-red-500">{state.error}</div>)}
      <div>
        <Button disabled={pending}>Create Post</Button>
      </div>
    </form>
  );
}
