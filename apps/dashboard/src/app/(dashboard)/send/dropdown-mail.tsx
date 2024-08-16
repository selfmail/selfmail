"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "ui";
import { useMailStore } from "./store";

export default function DropdownMailList({ adresses }: { adresses: string[] }) {
  const { adresse, updateAdresse } = useMailStore();
  return (
    <div className="flex items-center space-x-1 ">
      <DropdownMenu>
        <DropdownMenuTrigger>
          Adresse
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {
            adresses.map((a) => (
              <DropdownMenuItem key={a} onClick={() => updateAdresse(a)}>
                {a}
              </DropdownMenuItem>
            ))
          }
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
