import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "#/components/ui";
import { getMemberAddresses } from "#/lib/workspaces/addresses";
import { m } from "#/paraglide/messages";

interface AddressAutocompleteProps {
  defaultValue?: string;
  workspaceSlug: string;
}

export function AddressAutocomplete({
  defaultValue,
  workspaceSlug,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState<string>();
  const addressesQuery = useQuery({
    queryKey: ["member-addresses", workspaceSlug],
    queryFn: () => getMemberAddresses({ data: { workspaceSlug } }),
  });
  const addresses = addressesQuery.data?.map((address) => address.email) ?? [];
  const value = inputValue ?? defaultValue ?? addresses[0] ?? "";
  const placeholder = addressesQuery.isPending
    ? m["dashboard.compose.loading_addresses"]()
    : m["dashboard.compose.from"]();

  return (
    <>
      <Autocomplete
        autoHighlight
        disabled={addressesQuery.isPending || addressesQuery.isError}
        filter={(address, query) =>
          addresses.includes(query) ||
          address.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
        }
        items={addresses}
        name="from"
        onValueChange={setInputValue}
        openOnInputClick
        value={value}
      >
        <AutocompleteInput
          aria-label={m["dashboard.compose.from"]()}
          autoComplete="off"
          className="h-14 rounded-none border-0 border-border border-b px-4 py-4 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          placeholder={placeholder}
          required
          type="email"
        />
        <AutocompleteContent className="rounded-none" sideOffset={-1}>
          <AutocompleteEmpty>
            {m["dashboard.compose.no_addresses"]()}
          </AutocompleteEmpty>
          <AutocompleteList>
            {(address: string, index: number) => (
              <AutocompleteItem
                className="cursor-pointer hover:bg-accent"
                index={index}
                key={address}
                value={address}
              >
                <span className="truncate">{address}</span>
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
      {addressesQuery.isError && (
        <button
          className="px-4 py-2 text-left text-destructive text-sm"
          onClick={() => addressesQuery.refetch()}
          type="button"
        >
          {m["dashboard.email.load_more_retry"]()}
        </button>
      )}
    </>
  );
}
