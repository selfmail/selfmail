import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui";
import { getMemberAddresses } from "#/lib/workspaces/addresses";

export default function AddressSelect({
  defaultValue,
  workspaceSlug,
}: {
  defaultValue?: string;
  workspaceSlug: string;
}) {
  const [selectedAddress, setSelectedAddress] = useState<string>();
  const addressesQuery = useQuery({
    queryKey: ["member-addresses", workspaceSlug],
    queryFn: async () => {
      return await getMemberAddresses({ data: { workspaceSlug } });
    },
  });
  const addresses = addressesQuery.data ?? [];
  const firstAddress = addresses[0]?.email;
  const selectedValue = selectedAddress ?? firstAddress ?? defaultValue;
  const placeholder = (() => {
    if (addressesQuery.isLoading) {
      return "Loading addresses";
    }
    if (addresses.length === 0) {
      return "No addresses available";
    }
    return "Select an address";
  })();

  useEffect(() => {
    setSelectedAddress(firstAddress ?? defaultValue);
  }, [defaultValue, firstAddress]);

  return (
    <div className="grid gap-2 sm:grid-cols-[4.5rem_1fr] sm:items-center">
      <Label className="text-muted-foreground" htmlFor="compose-from">
        From
      </Label>
      <Select
        disabled={addressesQuery.isLoading || addresses.length === 0}
        name="from"
        onValueChange={setSelectedAddress}
        value={selectedValue}
      >
        <SelectTrigger
          className="h-10 rounded-lg border-0 bg-muted px-3 text-sm"
          id="compose-from"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {addresses.map((address) => (
            <SelectItem key={address.id} value={address.email}>
              {address.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
