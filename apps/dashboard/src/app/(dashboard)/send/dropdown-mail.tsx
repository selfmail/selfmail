"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectItemText, SelectTrigger, SelectValue } from "ui";
import { useMailStore } from "./store";

export default function DropdownMailList({ adresses }: { adresses: string[] }) {
  const { adresse, updateAdresse } = useMailStore();
  return (
    <div className="flex items-center space-x-1 ">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an adresse" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {adresses.map((adresse) => (
              <SelectItem value={adresse} key={adresse}>
                <SelectItemText>{adresse}</SelectItemText>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
