"use client";

import { useState } from "react";
import { Button, EmailInput, Input } from "ui";
import { CreateAdresse } from "./action";
import { z } from "zod";

const initialState = {
  message: undefined,
  error: undefined,
};

export default function NewAdresseForm() {
  const [error, setError] = useState<string | undefined>(undefined);
  const [state, formAction] = useActionState(CreateAdresse, initialState);
  const adresseSchema = z.object({
    email: z.string().email().endsWith("@selfmail.app"),
    type: z.enum(["second", "spam"]),
  });
  return (
    <form
      className="lg:w-[400px]"
      action={async (e) => {
        setError(undefined);
        console.log((e.get("second") && "second") || (e.get("spam") && "spam"));
        const parse = await adresseSchema.safeParseAsync({
          email: e.get("email"),
          type: e.get("type"),
        });
        if (!parse.success) {
          setError(
            "We had an error when parsing the provided fields. Please check your inputs!",
          );
          return;
        }
        formAction(e);
      }}
    >
      <EmailInput
        required
        className="w-full"
        placeholder="You adresse"
        name="email"
      />
      <div className="flex flex-col">
        <h3 className="text-xl">Type</h3>
        <select name="type" id="" className="rounded-lg p-2">
          <option value="second">Second</option>
          <option value="spam">Spam</option>
        </select>
      </div>
      {(state.error && <p className="mt-2 text-red-700">{state.error}</p>) ||
        (error && <p className="mt-2 text-red-700">{error}</p>)}
      <div className="mt-2">
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
