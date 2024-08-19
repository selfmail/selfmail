"use client";

import { Input } from "ui";
import { useMailStore } from "./store";

export default function HeaderInputs() {
  const { updateSubject, updateRecipient, recipient, subject } = useMailStore();

  return (
    <>
      <Input
        placeholder="Subject..."
        value={subject}
        onChange={(e) =>
          updateSubject(
            e.currentTarget.value === "" ? undefined : e.currentTarget.value,
          )
        }
        className="mt-2 border border-b-2 border-t-2 border-b-[#d1d1d1] text-black border-t-[#d1d1d1] bg-transparent p-2 outline-none"
      />
      <Input
        placeholder="Recipient..."
        value={recipient}
        onChange={(e) =>
          updateRecipient(
            e.currentTarget.value === "" ? undefined : e.currentTarget.value,
          )
        }
        className="mb-2 border border-b-2 border-b-[#d1d1d1]  text-black bg-transparent p-2 outline-none"
      />
    </>
  );
}
